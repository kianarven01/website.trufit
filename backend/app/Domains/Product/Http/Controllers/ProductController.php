<?php

namespace App\Domains\Product\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Product\Domain\Models\Product;
use App\Domains\Product\Application\DTO\CreateProductDTO;
use App\Domains\Product\Application\UseCases\CreateProduct;
use App\Domains\Product\Http\Requests\StoreProductRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $variantId = $request->query('variant_id');
        $categoryId = $request->query('category_id');

        $products = Product::query()
            ->with(['category', 'manufacturer', 'unitRelation'])
            ->when($categoryId, function ($query) use ($categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->when($variantId, function ($query) use ($variantId) {
                $query->whereHas('vehicleCompatibilities', function ($compatibilityQuery) use ($variantId) {
                    $compatibilityQuery->where('car_variant_id', $variantId);
                });
            })
            ->orderBy('name')
            ->get();

        $data = $products->map(function (Product $product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'SKU' => $product->SKU,
                'cost' => $product->cost,
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

                'quantity_on_hand' => null,
                'sell_price' => null,
            ];
        })->values();

        return response()->json($data);
    }

    public function store(StoreProductRequest $request, CreateProduct $createProduct): JsonResponse
    {
        $validated = $request->validated();

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('product_images', 'public');
            $validated['image_path'] = asset('storage/' . $path);
        }

        $dto = CreateProductDTO::fromArray($validated);
        $product = $createProduct->execute($dto);

        return response()->json([
            'message' => 'Product created successfully.',
            'data' => $product,
        ], 201);
    }
}