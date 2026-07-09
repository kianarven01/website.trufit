<?php

namespace App\Domains\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Inventory\Domain\Models\Inventory;
use App\Domains\Inventory\Domain\Models\StockLocation;
use App\Domains\Product\Domain\Models\Product;
use App\Domains\Supplier\Domain\Models\ProductSupplier;
use App\Domains\Purchasing\Domain\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class InventoryController extends Controller
{
    private function getDefaultLocationId(): string
    {
        $location = StockLocation::where('is_active', true)->orderBy('name')->first();
        return $location?->id ?? 'd3b07384-d113-4ec6-a55d-752007414777';
    }

    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');
        $showArchived = $request->boolean('archived');
        $statusFilter = $request->query('status');

        $inventoryRows = Inventory::query()
            ->with([
                'product' => function ($q) use ($showArchived) {
                    if ($showArchived) {
                        $q->withTrashed();
                    }
                },
                'product.category',
                'product.part',
                'product.manufacturer',
                'product.unitRelation',
                'product.preferredSupplier.supplier',
                'product.preferredSupplier.price',
                'product.productSuppliers.inventory',
                'product.inventoryRows',
                'location',
                'bin',
            ])
            ->when(! $showArchived, function ($query) {
                $query->whereHas('product', function ($q) {
                    $q->whereNull('deleted_at')
                      ->whereDoesntHave('category', fn ($cq) => $cq->where('name', 'Sundries'));
                });
            })
            ->when($showArchived, function ($query) {
                $query->whereHas('product', function ($q) {
                    $q->withTrashed()
                      ->whereDoesntHave('category', fn ($cq) => $cq->where('name', 'Sundries'));
                });
            })
            ->when($search, function ($query) use ($search) {
                $query->whereHas('product', function ($productQuery) use ($search) {
                    $productQuery
                        ->where('name', 'ILIKE', "%{$search}%")
                        ->orWhere('SKU', 'ILIKE', "%{$search}%")
                        ->orWhere('part_number', 'ILIKE', "%{$search}%");
                });
            })
            ->orderBy('id')
            ->get()
            ->groupBy('productID')
            ->map(fn ($rows) => $this->formatGroupedInventory($rows))
            ->values();

        // When showing archived, also include soft-deleted products that have NO inventory records
        if ($showArchived) {
            $existingProductIds = $inventoryRows->pluck('product_id')->filter()->values();

            $archivedWithoutInventory = Product::onlyTrashed()
                ->with(['category', 'manufacturer', 'unitRelation'])
                ->whereDoesntHave('category', fn ($q) => $q->where('name', 'Sundries'))
                ->when($search, function ($query) use ($search) {
                    $query->where('name', 'ILIKE', "%{$search}%")
                        ->orWhere('SKU', 'ILIKE', "%{$search}%")
                        ->orWhere('part_number', 'ILIKE', "%{$search}%");
                })
                ->whereDoesntHave('inventoryRows')
                ->get()
                ->map(fn ($product) => $this->formatArchivedProductWithoutInventory($product))
                ->values();

            $inventoryRows = $inventoryRows->merge($archivedWithoutInventory)->values();
        }

        if ($statusFilter) {
            $statusMap = [
                'in-stock' => 'In Stock',
                'low-stock' => 'Low Stock',
                'out-of-stock' => 'Out of Stock',
            ];
            $normalizedStatus = $statusMap[$statusFilter] ?? $statusFilter;
            $inventoryRows = $inventoryRows->filter(
                fn ($item) => $item['status'] === $normalizedStatus
            )->values();
        }

        return response()->json([
            'data' => $inventoryRows,
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $inventoryRows = Inventory::query()
            ->with([
                'product.category',
                'product.part',
                'product.manufacturer',
                'product.unitRelation',
                'product.preferredSupplier.supplier',
                'product.preferredSupplier.price',
                'product.productSuppliers.inventory',
                'product.vehicleCompatibilities.vehicleVariant.vehicleModel.manufacturer',
                'product.equivalentGroups.items.product.manufacturer',
                'product.equivalentGroups.items.product.inventoryRows',
                'location',
                'bin',
            ])
            ->where('productID', $id)
            ->orderBy('id')
            ->get();

        if ($inventoryRows->isEmpty()) {
            return response()->json(['message' => 'Inventory not found'], 404);
        }

        $grouped = $this->formatGroupedInventory($inventoryRows, includeDetails: true);

        return response()->json([
            'data' => $grouped,
        ]);
    }

    public function adjustStock(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'uuid'],
            'product_supplier_id' => ['nullable', 'uuid'],
            'location_id' => ['nullable', 'uuid'],
            'bin_id' => ['nullable', 'uuid'],
            'quantity_on_hand' => ['required', 'integer', 'min:0'],
            'reserved_quantity' => ['nullable', 'integer', 'min:0'],
            'reorder_level' => ['nullable', 'integer', 'min:0'],
            'reorder_qty' => ['nullable', 'integer', 'min:0'],
        ]);

        $product = Product::findOrFail($validated['product_id']);

        $productSupplierId = $validated['product_supplier_id'] ?? null;

        if (empty($productSupplierId)) {
            $resolved = $product->resolvePreferredSupplier();
            if ($resolved) {
                $productSupplierId = $resolved->id;
            } else {
                $suppliersForProduct = ProductSupplier::where('product_id', $product->id)->get();

                if ($suppliersForProduct->count() === 1) {
                    $productSupplierId = $suppliersForProduct->first()->id;
                } elseif ($suppliersForProduct->count() > 1) {
                    return response()->json([
                        'message' => 'This product has multiple suppliers. Please select a specific supplier to adjust stock.',
                    ], 422);
                }
            }
        } else {
            ProductSupplier::query()
                ->where('id', $productSupplierId)
                ->where('product_id', $product->id)
                ->firstOrFail();
        }

        $locationId = $validated['location_id'] ?? $this->getDefaultLocationId();
        $binId = $validated['bin_id'] ?? null;

        $inventory = DB::transaction(function () use ($validated, $product, $productSupplierId, $locationId, $binId) {
            return Inventory::updateOrCreate(
                [
                    'productID' => $product->id,
                    'product_supplier_id' => $productSupplierId,
                    'location_id' => $locationId,
                ],
                [
                    'quantity_on_hand' => $validated['quantity_on_hand'],
                    'reserved_quantity' => $validated['reserved_quantity'] ?? 0,
                    'reorder_level' => $validated['reorder_level'] ?? 5,
                    'reorder_qty' => $validated['reorder_qty'] ?? 10,
                    'bin_id' => $binId,
                ]
            );
        });

        $inventory->load([
            'product.category',
            'product.part',
            'product.manufacturer',
            'product.unitRelation',
            'product.preferredSupplier.supplier',
            'product.preferredSupplier.price',
            'location',
            'bin',
        ]);

        return response()->json([
            'message' => 'Inventory stock adjusted successfully.',
            'data' => $this->formatInventory($inventory),
        ]);
    }

    public function updateLocation(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'location_id' => ['required', 'string', 'exists:StockLocations,id'],
            'bin_id' => ['nullable', 'string', 'exists:BinLocations,id'],
        ]);

        $inventory = Inventory::findOrFail($id);

        $inventory->update([
            'location_id' => $validated['location_id'],
            'bin_id' => $validated['bin_id'] ?? null,
        ]);

        $inventory->load([
            'product.category',
            'product.part',
            'product.manufacturer',
            'product.unitRelation',
            'product.preferredSupplier.supplier',
            'product.preferredSupplier.price',
            'location',
            'bin',
        ]);

        return response()->json([
            'message' => 'Location updated successfully.',
            'data' => $this->formatInventory($inventory),
        ]);
    }

    public function deductSundries(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'uuid'],
            'quantity' => ['required', 'integer', 'min:1'],
            'notes' => ['nullable', 'string'],
        ]);

        $product = Product::findOrFail($validated['product_id']);

        $locationId = $this->getDefaultLocationId();

        $result = DB::transaction(function () use ($validated, $product, $locationId) {
            $inventory = Inventory::query()
                ->where('productID', $product->id)
                ->lockForUpdate()
                ->first();

            if (! $inventory) {
                return ['error' => 'No inventory record found for this product.', 'code' => 404];
            }

            $quantityToDeduct = (int) $validated['quantity'];

            if ((int) $inventory->quantity_on_hand < $quantityToDeduct) {
                return [
                    'error' => "Insufficient stock. Available: {$inventory->quantity_on_hand}, requested: {$quantityToDeduct}.",
                    'code' => 422,
                ];
            }

            $inventory->quantity_on_hand = (int) $inventory->quantity_on_hand - $quantityToDeduct;
            $inventory->save();

            StockMovement::create([
                'inventory_id' => $inventory->id,
                'product_id' => $product->id,
                'product_supplier_id' => $inventory->product_supplier_id,
                'movement_type' => 'OUT_SUNDRIES',
                'quantity' => $quantityToDeduct,
                'reference_type' => null,
                'reference_id' => null,
                'notes' => $validated['notes'] ?? null,
                'created_by' => null,
            ]);

            return ['inventory' => $inventory];
        });

        if (isset($result['error'])) {
            return response()->json(['message' => $result['error']], $result['code']);
        }

        $inventory = $result['inventory'];
        $inventory->load([
            'product.category',
            'product.part',
            'product.manufacturer',
            'product.unitRelation',
            'product.preferredSupplier.supplier',
            'product.preferredSupplier.price',
            'location',
            'bin',
        ]);

        return response()->json([
            'message' => 'Sundries usage deducted successfully.',
            'data' => $this->formatInventory($inventory),
        ]);
    }

    public function sundriesMovements(Request $request): JsonResponse
    {
        $query = StockMovement::with(['product.category', 'product.manufacturer'])
            ->where('movement_type', 'OUT_SUNDRIES');

        $from = $request->query('from');
        $to = $request->query('to');

        if ($from) {
            $query->where('created_at', '>=', $from);
        }

        if ($to) {
            $query->where('created_at', '<=', $to . ' 23:59:59');
        }

        $movements = $query->orderByDesc('created_at')
            ->get()
            ->map(fn ($movement) => [
                'id' => $movement->id,
                'product_id' => $movement->product_id,
                'product_name' => $movement->product?->name ?? 'Unknown',
                'product_image' => $movement->product?->image_path,
                'product_brand' => $movement->product?->manufacturer?->name ?? '-',
                'quantity' => $movement->quantity,
                'notes' => $movement->notes,
                'created_by' => $movement->created_by,
                'created_at' => $movement->created_at?->toIso8601String(),
            ]);

        return response()->json(['data' => $movements]);
    }

    public function reverseSundries(string $id): JsonResponse
    {
        $result = DB::transaction(function () use ($id) {
            $movement = StockMovement::where('id', $id)
                ->where('movement_type', 'OUT_SUNDRIES')
                ->first();

            if (! $movement) {
                return ['error' => 'Stock movement not found or is not a sundries deduction.', 'code' => 404];
            }

            $inventory = null;
            if ($movement->inventory_id) {
                $inventory = Inventory::where('id', $movement->inventory_id)->lockForUpdate()->first();
            }

            if (! $inventory) {
                $inventory = Inventory::query()
                    ->where('productID', $movement->product_id)
                    ->lockForUpdate()
                    ->first();
            }

            if (! $inventory) {
                return ['error' => 'No inventory record found for this product.', 'code' => 404];
            }

            // Restore the stock
            $inventory->quantity_on_hand = (int) $inventory->quantity_on_hand + (int) $movement->quantity;
            $inventory->save();

            // Delete the movement record
            $movement->delete();

            return ['inventory' => $inventory];
        });

        if (isset($result['error'])) {
            return response()->json(['message' => $result['error']], $result['code']);
        }

        return response()->json([
            'message' => 'Sundries deduction reversed successfully.',
        ]);
    }

    private function getSellingPrice(Product $product): ?float
    {
        $preferredSupplier = $product->resolvePreferredSupplier();

        if ($preferredSupplier) {
            $price = $preferredSupplier->price;
            if ($price) {
                return (float) $price->Price;
            }
        }

        // Fallback: read from Inventory.sell_price when no suppliers
        $inventory = $product->inventoryRows->first();
        return $inventory?->sell_price ? (float) $inventory->sell_price : null;
    }

    private function formatInventory(Inventory $inventory): array
    {
        $product = $inventory->product;

        $availableQuantity =
            (int) $inventory->quantity_on_hand - (int) $inventory->reserved_quantity;

        return [
            'id' => $inventory->id,
            'product_id' => $inventory->productID,
            'product_supplier_id' => $inventory->product_supplier_id,

            'quantity_on_hand' => $inventory->quantity_on_hand,
            'reserved_quantity' => $inventory->reserved_quantity,
            'available_quantity' => $availableQuantity,
            'reorder_level' => $inventory->reorder_level,
            'reorder_qty' => $inventory->reorder_qty,
            'location_id' => $inventory->location_id,
            'location_name' => $inventory->location?->name ?? $inventory->location_id,
            'bin_id' => $inventory->bin_id,
            'bin_name' => $inventory->bin?->name ?? $inventory->bin?->code,

            'product' => $product ? [
                'id' => $product->id,
                'name' => $product->name,
                'SKU' => $product->SKU,
                'part_number' => $product->part_number,
                'barcode' => $product->barcode,
                'description' => $product->description,
                'image_URL' => $product->image_path,

                'category_id' => $product->category_id,
                'category_name' => $product->category?->name,
                'category_is_spol' => $product->category?->is_spol ?? false,

                'part_id' => $product->part_id,
                'part_name' => $product->part?->name,

                'manufacturer_id' => $product->manufacturer_id,
                'manufacturer_name' => $product->manufacturer?->name,

                'unit' => $product->unit,
                'unit_name' => $product->unitRelation?->name,
                'unit_abbreviation' => $product->unitRelation?->abbreviation,
            ] : null,

            'selling_price' => $product ? $this->getSellingPrice($product) : null,

            'status' => ((int) $inventory->quantity_on_hand > 0)
                ? 'In Stock'
                : 'Out of Stock',
        ];
    }

    private function formatGroupedInventory($rows, bool $includeDetails = false): array
    {
        $first = $rows->first();
        $product = $first->product;

        $totalOnHand = (int) $rows->sum('quantity_on_hand');
        $totalReserved = (int) $rows->sum('reserved_quantity');
        $availableQuantity = $totalOnHand - $totalReserved;

        $reorderLevel = (int) $first->reorder_level;
        $reorderQty = (int) $first->reorder_qty;

        $status = match (true) {
            $totalOnHand <= 0 => 'Out of Stock',
            $reorderLevel > 0 && $totalOnHand <= $reorderLevel => 'Low Stock',
            default => 'In Stock',
        };

        $locationId = $first->location_id;
        $locationName = $first->location?->name ?? $locationId;

        $bins = $rows->filter(fn ($r) => $r->bin_id)
            ->map(fn ($r) => ['id' => $r->bin_id, 'name' => $r->bin?->name ?? $r->bin?->code])
            ->unique('id')
            ->values()
            ->all();

        $result = [
            'id' => $first->id,
            'product_id' => $first->productID,
            'product' => $product ? [
                'id' => $product->id,
                'name' => $product->name,
                'SKU' => $product->SKU,
                'part_number' => $product->part_number,
                'barcode' => $product->barcode,
                'description' => $product->description,
                'image_URL' => $product->image_path,
                'category_id' => $product->category_id,
                'category_name' => $product->category?->name,
                'category_is_spol' => $product->category?->is_spol ?? false,
                'part_id' => $product->part_id,
                'part_name' => $product->part?->name,
                'manufacturer_id' => $product->manufacturer_id,
                'manufacturer_name' => $product->manufacturer?->name,
                'unit' => $product->unit,
                'unit_name' => $product->unitRelation?->name,
                'unit_abbreviation' => $product->unitRelation?->abbreviation,
            ] : null,
            'quantity_on_hand' => $totalOnHand,
            'reserved_quantity' => $totalReserved,
            'available_quantity' => $availableQuantity,
            'reorder_level' => $reorderLevel,
            'reorder_qty' => $reorderQty,
            'location_id' => $locationId,
            'location_name' => $locationName,
            'bin_id' => $first->bin_id,
            'bin_name' => $first->bin?->name ?? $first->bin?->code,
            'bins' => $bins,
            'selling_price' => $product ? $this->getSellingPrice($product) : null,
            'status' => $status,
            'is_archived' => $product && $product->trashed(),
        ];

        if ($includeDetails && $product) {
            $result['compatible_vehicles'] = $this->formatVehicleCompatibilities($product);
            $result['equivalent_groups'] = $this->formatEquivalentGroups($product);
        }

        return $result;
    }

    private function formatArchivedProductWithoutInventory(Product $product): array
    {
        return [
            'product_id' => $product->id,
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'SKU' => $product->SKU,
                'part_number' => $product->part_number,
                'barcode' => $product->barcode,
                'description' => $product->description,
                'image_URL' => $product->image_path,
                'category_id' => $product->category_id,
                'category_name' => $product->category?->name,
                'category_is_spol' => $product->category?->is_spol ?? false,
                'part_id' => $product->part_id,
                'part_name' => $product->part?->name,
                'manufacturer_id' => $product->manufacturer_id,
                'manufacturer_name' => $product->manufacturer?->name,
                'unit' => $product->unit,
                'unit_name' => $product->unitRelation?->name,
                'unit_abbreviation' => $product->unitRelation?->abbreviation,
            ],
            'quantity_on_hand' => 0,
            'reserved_quantity' => 0,
            'available_quantity' => 0,
            'reorder_level' => 0,
            'reorder_qty' => 0,
            'location_id' => null,
            'bin_id' => null,
            'selling_price' => null,
            'status' => 'Out of Stock',
            'is_archived' => true,
        ];
    }

    private function formatVehicleCompatibilities(Product $product): array
    {
        if (!$product->relationLoaded('vehicleCompatibilities')) {
            return [];
        }

        $product->vehicleCompatibilities->loadMissing('vehicleVariant.vehicleModel.manufacturer');

        return $product->vehicleCompatibilities
            ->map(function ($compatibility) {
                $variant = $compatibility->vehicleVariant;

                return [
                    'id' => $compatibility->id,
                    'product_id' => $compatibility->product_id,
                    'car_variant_id' => $compatibility->car_variant_id,
                    'notes' => $compatibility->notes,
                    'vehicle_variant' => $variant ? [
                        'id' => $variant->id,
                        'variant_name' => $variant->variant_name,
                        'variant' => $variant->variant_name,
                        'year' => $variant->year,
                        'model' => $variant->vehicleModel?->model,
                        'make' => $variant->vehicleModel?->manufacturer?->name,
                        'vehicle_model' => $variant->vehicleModel ? [
                            'id' => $variant->vehicleModel->id,
                            'model' => $variant->vehicleModel->model,
                            'make' => $variant->vehicleModel->manufacturer?->name,
                        ] : null,
                    ] : null,
                    'name' => $variant?->variant_name,
                ];
            })
            ->values()
            ->all();
    }

    private function formatEquivalentGroups(Product $product): array
    {
        if (!$product->relationLoaded('equivalentGroups')) {
            return [];
        }

        return $product->equivalentGroups
            ->map(function ($group) use ($product) {
                $items = $group->items
                    ->filter(fn ($item) => $item->product_id !== $product->id)
                    ->map(function ($item) {
                        $equivProduct = $item->product;
                        $totalStock = $equivProduct
                            ? $equivProduct->inventoryRows->sum('quantity_on_hand')
                            : 0;

                        return [
                            'id' => $equivProduct?->id,
                            'name' => $equivProduct?->name ?? 'Unknown',
                            'SKU' => $equivProduct?->SKU,
                            'part_number' => $equivProduct?->part_number,
                            'manufacturer_name' => $equivProduct?->manufacturer?->name,
                            'quantity_on_hand' => (int) $totalStock,
                        ];
                    })
                    ->values();

                return [
                    'id' => $group->id,
                    'name' => $group->name,
                    'notes' => $group->notes,
                    'products' => $items,
                ];
            })
            ->values()
            ->all();
    }
}
