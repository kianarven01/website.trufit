<?php

namespace App\Domains\Product\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Product\Domain\Models\Product;
use App\Domains\Product\Domain\Models\ProductEquivalent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProductEquivalentController extends Controller
{
    public function index(string $productId): JsonResponse
    {
        Product::query()->findOrFail($productId);

        $links = ProductEquivalent::query()
            ->with([
                'baseProduct.category',
                'baseProduct.manufacturer',
                'baseProduct.unitRelation',
                'baseProduct.suppliers',
                'equivalentProduct.category',
                'equivalentProduct.manufacturer',
                'equivalentProduct.unitRelation',
                'equivalentProduct.suppliers',
            ])
            ->where('base_product_id', $productId)
            ->orWhere('equivalent_product_id', $productId)
            ->get();

        $products = $links->map(function (ProductEquivalent $link) use ($productId) {
            $product = $link->base_product_id === $productId
                ? $link->equivalentProduct
                : $link->baseProduct;

            return $this->formatEquivalentProduct($product, $link->notes);
        })->filter()->unique('id')->values();

        return response()->json([
            'data' => $products,
        ]);
    }

    public function store(Request $request, string $productId): JsonResponse
    {
        Product::query()->findOrFail($productId);

        $validated = $request->validate([
            'equivalent_product_ids' => ['required', 'array', 'min:1'],
            'equivalent_product_ids.*' => [
                'required',
                'uuid',
                'distinct',
                Rule::exists('Products', 'id'),
            ],
            'notes' => ['nullable', 'string'],
        ]);

        $created = DB::transaction(function () use ($validated, $productId) {
            $links = collect();

            foreach ($validated['equivalent_product_ids'] as $equivalentProductId) {
                if ($equivalentProductId === $productId) {
                    continue;
                }

                $link = ProductEquivalent::query()->firstOrCreate(
                    [
                        'base_product_id' => $productId,
                        'equivalent_product_id' => $equivalentProductId,
                    ],
                    [
                        'id' => (string) Str::uuid(),
                        'notes' => $validated['notes'] ?? null,
                    ]
                );

                $links->push($link);
            }

            return $links;
        });

        return response()->json([
            'message' => 'Equivalent products saved successfully.',
            'data' => $created->values(),
        ], 201);
    }

    public function destroy(string $productId, string $equivalentProductId): JsonResponse
    {
        Product::query()->findOrFail($productId);

        ProductEquivalent::query()
            ->where(function ($query) use ($productId, $equivalentProductId) {
                $query->where('base_product_id', $productId)
                    ->where('equivalent_product_id', $equivalentProductId);
            })
            ->orWhere(function ($query) use ($productId, $equivalentProductId) {
                $query->where('base_product_id', $equivalentProductId)
                    ->where('equivalent_product_id', $productId);
            })
            ->delete();

        return response()->json([
            'message' => 'Equivalent product removed successfully.',
        ]);
    }

    private function formatEquivalentProduct(?Product $product, ?string $notes = null): ?array
    {
        if (!$product) {
            return null;
        }

        $firstSupplier = $product->suppliers->first();

        return [
            'id' => $product->id,
            'name' => $product->name,
            'SKU' => $product->SKU,
            'description' => $product->description,
            'image_URL' => $product->image_path,
            'barcode' => $product->barcode,
            'part_number' => $product->part_number,

            'category_id' => $product->category_id,
            'category_name' => $product->category?->name,

            'unit' => $product->unit,
            'unit_name' => $product->unitRelation?->name,

            'manufacturer_id' => $product->manufacturer_id,
            'manufacturer_name' => $product->manufacturer?->name,

            'supplier_name' => $firstSupplier?->CompanyName,
            'supplier_code' => $firstSupplier?->supplier_code,
            'cost' => $firstSupplier?->pivot?->supplier_cost,

            'fitment_type' => 'equivalent',
            'equivalence_notes' => $notes,
        ];
    }
}