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
                'productSupplier.supplier',
                'productSupplier.price',
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
                'product.productSuppliers.supplier',
                'product.productSuppliers.price',
                'productSupplier.supplier',
                'productSupplier.price',
            ])
            ->where('productID', $id)
            ->orderBy('id')
            ->get();

        if ($inventoryRows->isEmpty()) {
            return response()->json(['message' => 'Inventory not found'], 404);
        }

        $grouped = $this->formatGroupedInventory($inventoryRows);

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

        // Auto-resolve product_supplier_id when not provided
        $productSupplierId = $validated['product_supplier_id'] ?? null;

        if (empty($productSupplierId)) {
            $suppliersForProduct = ProductSupplier::where('product_id', $product->id)->get();

            if ($suppliersForProduct->count() === 1) {
                $productSupplierId = $suppliersForProduct->first()->id;
            } elseif ($suppliersForProduct->count() > 1) {
                return response()->json([
                    'message' => 'This product has multiple suppliers. Please select a specific supplier to adjust stock.',
                ], 422);
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
            'productSupplier.supplier',
            'productSupplier.price',
        ]);

        return response()->json([
            'message' => 'Inventory stock adjusted successfully.',
            'data' => $this->formatInventory($inventory),
        ]);
    }

    private function formatInventory(Inventory $inventory, bool $includeProductSuppliers = false): array
    {
        $product = $inventory->product;
        $productSupplier = $inventory->productSupplier;
        $price = $productSupplier?->price;

        $availableQuantity =
            (int) $inventory->quantity_on_hand - (int) $inventory->reserved_quantity;

        $data = [
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

            'supplier' => $productSupplier?->supplier ? [
                'id' => $productSupplier->supplier->id,
                'CompanyName' => $productSupplier->supplier->CompanyName,
                'name' => $productSupplier->supplier->CompanyName,
                'supplier_code' => $productSupplier->supplier->supplier_code,
            ] : null,

            'supplier_cost' => $productSupplier?->supplier_cost,

            'active_price' => $price ? [
                'id' => $price->id,
                'product_supplier_id' => $price->product_supplier_id,
                'Price' => $price->Price,
                'Markup' => $price->Markup,
            ] : null,

            'price' => $price?->Price,
            'markup' => $price?->Markup,

            'status' => ((int) $inventory->quantity_on_hand > 0)
                ? 'In Stock'
                : 'Out of Stock',
        ];

        if ($includeProductSuppliers && $product) {
            $data['product_suppliers'] = $product->productSuppliers
                ->map(function ($productSupplier) {
                    return [
                        'id' => $productSupplier->id,
                        'supplier_id' => $productSupplier->supplier_id,
                        'supplier_cost' => $productSupplier->supplier_cost,

                        'supplier' => $productSupplier->supplier ? [
                            'id' => $productSupplier->supplier->id,
                            'CompanyName' => $productSupplier->supplier->CompanyName,
                            'name' => $productSupplier->supplier->CompanyName,
                            'supplier_code' => $productSupplier->supplier->supplier_code,
                        ] : null,

                        'active_price' => $productSupplier->price ? [
                            'id' => $productSupplier->price->id,
                            'product_supplier_id' => $productSupplier->price->product_supplier_id,
                            'Price' => $productSupplier->price->Price,
                            'Markup' => $productSupplier->price->Markup,
                        ] : null,
                    ];
                })
                ->values();
        }

        return $data;
    }

    private function formatGroupedInventory($rows): array
    {
        $first = $rows->first();
        $product = $first->product;

        $totalOnHand = (int) $rows->sum('quantity_on_hand');
        $totalReserved = (int) $rows->sum('reserved_quantity');
        $availableQuantity = $totalOnHand - $totalReserved;

        $reorderLevel = (int) $first->reorder_level;
        $reorderQty = (int) $first->reorder_qty;

        $suppliers = $rows->map(function ($row) {
            $ps = $row->productSupplier;
            $price = $ps?->price;

            return [
                'id' => $row->id,
                'product_supplier_id' => $row->product_supplier_id,
                'supplier' => $ps?->supplier ? [
                    'id' => $ps->supplier->id,
                    'CompanyName' => $ps->supplier->CompanyName,
                    'name' => $ps->supplier->CompanyName,
                    'supplier_code' => $ps->supplier->supplier_code,
                ] : null,
                'supplier_cost' => $ps?->supplier_cost,
                'price' => $price?->Price,
                'markup' => $price?->Markup,
                'inventory_id' => $row->id,
                'quantity_on_hand' => (int) $row->quantity_on_hand,
                'reserved_quantity' => (int) $row->reserved_quantity,
                'reorder_level' => (int) $row->reorder_level,
                'reorder_qty' => (int) $row->reorder_qty,
            ];
        })->values();

        $lowestPrice = $suppliers->pluck('price')->filter()->min() ?? null;
        $highestPrice = $suppliers->pluck('price')->filter()->max() ?? null;

        $status = match (true) {
            $totalOnHand <= 0 => 'Out of Stock',
            $reorderLevel > 0 && $totalOnHand <= $reorderLevel => 'Low Stock',
            default => 'In Stock',
        };

        $locationId = $first->location_id;

        return [
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
            'suppliers' => $suppliers,
            'quantity_on_hand' => $totalOnHand,
            'reserved_quantity' => $totalReserved,
            'available_quantity' => $availableQuantity,
            'reorder_level' => $reorderLevel,
            'reorder_qty' => $reorderQty,
            'location_id' => $locationId,
            'lowest_price' => $lowestPrice,
            'highest_price' => $highestPrice,
            'price' => $lowestPrice,
            'status' => $status,
            'is_archived' => $product && $product->trashed(),
        ];
    }
}