<?php

namespace App\Domains\Product\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Inventory\Domain\Models\Inventory;
use App\Domains\Product\Application\Services\ProductFormatterService;
use App\Domains\Product\Domain\Models\Product;
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
            'quantity_on_hand' => ['required', 'integer', 'min:0'],
            'reserved_quantity' => ['nullable', 'integer', 'min:0'],
            'reorder_level' => ['nullable', 'integer', 'min:0'],
            'reorder_qty' => ['nullable', 'integer', 'min:0'],
            'location_id' => ['nullable', 'uuid'],
        ]);

        $product = Product::findOrFail($id);

        Inventory::updateOrCreate(
            [
                'productID' => $product->id,
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
