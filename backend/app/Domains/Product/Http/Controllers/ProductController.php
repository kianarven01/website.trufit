<?php

namespace App\Domains\Product\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Product\Domain\Models\Product;
use App\Domains\Product\Domain\Models\ProductVehicleCompatibility;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

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

                'is_oem' => $product->is_oem,
                'oem_reference_number' => $product->oem_reference_number,

                'quantity_on_hand' => null,
                'sell_price' => null,
            ];
        })->values();

        return response()->json($data);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'SKU' => ['required', 'string', 'max:255', Rule::unique('Main.Products', 'SKU')],
            'cost' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],

            'image' => ['nullable', 'image', 'max:5120'],

            'category_id' => ['nullable', 'integer'],
            'unit' => ['nullable', 'integer'],
            'manufacturer_id' => ['nullable', 'integer'],

            'barcode' => ['nullable', 'string', 'max:255', Rule::unique('Main.Products', 'barcode')],
            'part_number' => ['required', 'string', 'max:255'],
            'part_id' => ['nullable', 'integer'],

            'is_oem' => ['nullable', 'boolean'],
            'oem_reference_number' => ['nullable', 'string', 'max:255'],

            'car_variant_id' => ['nullable', 'integer'],
            'compatibility_notes' => ['nullable', 'string'],
        ]);

        $product = DB::transaction(function () use ($request, $validated) {
            $imageUrl = null;

            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('products', 'public');
                $imageUrl = Storage::url($path);
            }

            $product = Product::create([
                'id' => (string) Str::uuid(),
                'name' => $validated['name'],
                'SKU' => $validated['SKU'],
                'cost' => $validated['cost'],
                'description' => $validated['description'] ?? null,
                'image_path' => $imageUrl,

                'category_id' => $validated['category_id'] ?? null,
                'unit' => $validated['unit'] ?? null,
                'manufacturer_id' => $validated['manufacturer_id'] ?? null,

                'barcode' => $validated['barcode'] ?? null,
                'part_number' => $validated['part_number'],
                'part_id' => $validated['part_id'] ?? null,

                'is_oem' => $validated['is_oem'] ?? false,
                'oem_reference_number' => $validated['oem_reference_number'] ?? null,
            ]);

            if (!empty($validated['car_variant_id'])) {
                ProductVehicleCompatibility::create([
                    'product_id' => $product->id,
                    'car_variant_id' => $validated['car_variant_id'],
                    'notes' => $validated['compatibility_notes'] ?? null,
                    'created_at' => now(),
                ]);
            }

            return $product;
        });

        return response()->json([
            'message' => 'Product created successfully.',
            'data' => $product,
        ], 201);
    }
}