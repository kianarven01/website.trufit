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

        $inventoryRows = Inventory::query()
            ->with([
                'product.category',
                'product.part',
                'product.manufacturer',
                'product.unitRelation',
                'productSupplier.supplier',
                'productSupplier.price',
            ])
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
            ->map(fn (Inventory $inventory) => $this->formatInventory($inventory))
            ->values();

        return response()->json([
            'data' => $inventoryRows,
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $inventory = Inventory::query()
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
            ->where('id', $id)
            ->firstOrFail();

        return response()->json([
            'data' => $this->formatInventory($inventory, true),
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

        if (!empty($validated['product_supplier_id'])) {
            ProductSupplier::query()
                ->where('id', $validated['product_supplier_id'])
                ->where('product_id', $product->id)
                ->firstOrFail();
        }

        $locationId = $validated['location_id'] ?? 'd3b07384-d113-4ec6-a55d-752007414777';

        $inventory = DB::transaction(function () use ($validated, $product, $locationId) {
            return Inventory::updateOrCreate(
                [
                    'productID' => $product->id,
                    'product_supplier_id' => $validated['product_supplier_id'] ?? null,
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
}