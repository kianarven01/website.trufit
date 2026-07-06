<?php

namespace App\Domains\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Inventory\Domain\Models\Inventory;
use App\Domains\Product\Domain\Models\Product;
use App\Domains\Supplier\Domain\Models\ProductSupplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');
        $showArchived = $request->boolean('archived');
        $statusFilter = $request->query('status');

        $inventoryRows = Inventory::query()
            ->with([
                'product.category',
                'product.part',
                'product.manufacturer',
                'product.unitRelation',
                'product.preferredSupplier.supplier',
                'product.preferredSupplier.price',
                'product.productSuppliers.inventory',
            ])
            ->when(! $showArchived, function ($query) {
                $query->whereHas('product', fn ($q) => $q->whereNull('deleted_at'));
            })
            ->when($showArchived, function ($query) {
                $query->whereHas('product', fn ($q) => $q->withTrashed());
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

        $locationId = $validated['location_id'] ?? 'd3b07384-d113-4ec6-a55d-752007414777';

        $inventory = DB::transaction(function () use ($validated, $product, $productSupplierId, $locationId) {
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
                    'sell_price' => null,
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
        ]);

        return response()->json([
            'message' => 'Inventory stock adjusted successfully.',
            'data' => $this->formatInventory($inventory),
        ]);
    }

    private function getSellingPrice(Product $product): ?float
    {
        $preferredSupplier = $product->resolvePreferredSupplier();

        if (!$preferredSupplier) {
            return null;
        }

        $price = $preferredSupplier->price;

        return $price ? (float) $price->Price : null;
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

        $result = [
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
