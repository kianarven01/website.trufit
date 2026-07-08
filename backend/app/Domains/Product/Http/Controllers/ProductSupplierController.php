<?php

namespace App\Domains\Product\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Product\Application\Services\ProductFormatterService;
use App\Domains\Product\Application\Services\ProductSupplierService;
use App\Domains\Product\Domain\Models\Product;
use App\Domains\Product\Domain\Models\ProductPrice;
use App\Domains\Supplier\Domain\Models\ProductSupplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductSupplierController extends Controller
{
    public function __construct(
        private ProductSupplierService $supplierService,
        private ProductFormatterService $formatter
    ) {
    }

    public function store(Request $request, string $productId): JsonResponse
    {
        $validated = $request->validate([
            'supplier_id' => ['required', 'uuid'],
            'supplier_cost' => ['nullable', 'numeric', 'min:0'],
            'markup' => ['nullable', 'numeric'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'is_vat' => ['nullable', 'boolean'],
            'vat_percent' => ['nullable', 'numeric', 'min:0'],
        ]);

        $product = Product::findOrFail($productId);
        $updatedProduct = $this->supplierService->addSupplier($product, $validated);

        return response()->json([
            'message' => 'Supplier added to product successfully.',
            'data' => $this->formatter->format($updatedProduct),
        ], 201);
    }

    public function update(Request $request, string $productId, string $productSupplierId): JsonResponse
    {
        $validated = $request->validate([
            'supplier_cost' => ['nullable', 'numeric', 'min:0'],
            'markup' => ['nullable', 'numeric'],
            'price' => ['nullable', 'numeric', 'min:0'],
        ]);

        $product = Product::findOrFail($productId);
        $productSupplier = ProductSupplier::where('product_id', $product->id)
            ->where('id', $productSupplierId)
            ->firstOrFail();

        // Update supplier cost on ProductSupplier
        if (array_key_exists('supplier_cost', $validated)) {
            $productSupplier->update(['supplier_cost' => $validated['supplier_cost']]);
        }

        // Upsert ProductPrice record
        $priceData = [
            'Price' => $validated['price'] ?? null,
            'Markup' => $validated['markup'] ?? null,
        ];

        if ($productSupplier->price) {
            $productSupplier->price->update($priceData);
        } else {
            ProductPrice::create([
                'id' => (string) Str::uuid(),
                'product_supplier_id' => $productSupplier->id,
                ...$priceData,
            ]);
        }

        return response()->json([
            'message' => 'Supplier price updated.',
            'data' => $this->formatter->format($product->fresh([
                'productSuppliers',
                'productSuppliers.supplier',
                'productSuppliers.price',
                'inventoryRows',
                'category',
                'unitRelation',
                'manufacturer',
            ])),
        ]);
    }

    public function destroy(string $productId, string $productSupplierId): JsonResponse
    {
        try {
            $product = Product::findOrFail($productId);
            $updatedProduct = $this->supplierService->removeSupplier($product, $productSupplierId);

            return response()->json([
                'message' => 'Supplier removed from product successfully.',
                'data' => $this->formatter->format($updatedProduct),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
