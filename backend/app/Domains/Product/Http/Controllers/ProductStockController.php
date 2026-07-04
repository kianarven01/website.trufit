<?php

namespace App\Domains\Product\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Inventory\Domain\Models\Inventory;
use App\Domains\Product\Application\Services\ProductFormatterService;
use App\Domains\Product\Domain\Models\Product;
use App\Domains\Supplier\Domain\Models\ProductSupplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductStockController extends Controller
{
    private const DEFAULT_LOCATION_ID = 'd3b07384-d113-4ec6-a55d-752007414777';

    public function __construct(private ProductFormatterService $formatter)
    {
    }

    public function adjust(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'product_supplier_id' => ['nullable', 'uuid'],
            'quantity_on_hand' => ['required', 'integer', 'min:0'],
            'reserved_quantity' => ['nullable', 'integer', 'min:0'],
            'reorder_level' => ['nullable', 'integer', 'min:0'],
            'reorder_qty' => ['nullable', 'integer', 'min:0'],
            'location_id' => ['nullable', 'uuid'],
        ]);

        $product = Product::findOrFail($id);

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

        Inventory::updateOrCreate(
            [
                'productID' => $product->id,
                'product_supplier_id' => $productSupplierId,
                'location_id' => $validated['location_id'] ?? self::DEFAULT_LOCATION_ID,
            ],
            [
                'quantity_on_hand' => $validated['quantity_on_hand'],
                'reserved_quantity' => $validated['reserved_quantity'] ?? 0,
                'reorder_level' => $validated['reorder_level'] ?? 5,
                'reorder_qty' => $validated['reorder_qty'] ?? 10,
                'sell_price' => null,
            ]
        );

        $freshProduct = $product->fresh([
            'category',
            'manufacturer',
            'unitRelation',
            'part',
            'productSuppliers.supplier',
            'productSuppliers.price',
            'inventoryRelation',
            'inventoryRows.productSupplier.supplier',
            'inventoryRows.productSupplier.price',
            'vehicleCompatibilities.vehicleVariant',
        ]);

        return response()->json([
            'message' => 'Stock adjusted successfully.',
            'data' => $this->formatter->format($freshProduct),
        ]);
    }
}
