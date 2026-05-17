<?php

namespace App\Domains\Product\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Product\Domain\Models\Product;
use App\Domains\Product\Domain\Models\ProductEquivalent;
use App\Domains\Product\Application\DTO\CreateProductDTO;
use App\Domains\Product\Application\UseCases\CreateProduct;
use App\Domains\Product\Http\Requests\StoreProductRequest;
use App\Domains\Product\Application\Services\ProductImageUploader;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $variantId = $request->query('variant_id');
        $categoryId = $request->query('category_id');

        $baseQuery = Product::query()
            ->with(['category', 'manufacturer', 'unitRelation', 'suppliers', 'inventoryRelation']);

        if ($categoryId) {
            $baseQuery->where('category_id', $categoryId);
        }

        if (!$variantId) {
            $products = $baseQuery
                ->orderBy('name')
                ->get()
                ->map(fn (Product $product) => $this->formatProduct($product, 'unfiltered'))
                ->values();

            return response()->json($products);
        }

        $directProducts = (clone $baseQuery)
            ->whereHas('vehicleCompatibilities', function ($query) use ($variantId) {
                $query->where('car_variant_id', $variantId);
            })
            ->orderBy('name')
            ->get();

        $directProductIds = $directProducts->pluck('id')->values();

        if ($directProductIds->isEmpty()) {
            return response()->json([]);
        }

        $equivalentLinks = ProductEquivalent::query()
            ->whereIn('base_product_id', $directProductIds)
            ->orWhereIn('equivalent_product_id', $directProductIds)
            ->get();

        $equivalentProductIds = $equivalentLinks
            ->flatMap(function (ProductEquivalent $link) use ($directProductIds) {
                $ids = collect();

                if ($directProductIds->contains($link->base_product_id)) {
                    $ids->push($link->equivalent_product_id);
                }

                if ($directProductIds->contains($link->equivalent_product_id)) {
                    $ids->push($link->base_product_id);
                }

                return $ids;
            })
            ->unique()
            ->reject(fn ($id) => $directProductIds->contains($id))
            ->values();

        $equivalentProducts = collect();

        if ($equivalentProductIds->isNotEmpty()) {
            $equivalentProducts = Product::query()
                ->with(['category', 'manufacturer', 'unitRelation', 'suppliers', 'inventoryRelation'])
                ->whereIn('id', $equivalentProductIds)
                ->when($categoryId, fn ($query) => $query->where('category_id', $categoryId))
                ->orderBy('name')
                ->get();
        }

        $directFormatted = $directProducts
            ->map(fn (Product $product) => $this->formatProduct($product, 'direct'));

        $equivalentFormatted = $equivalentProducts
            ->map(function (Product $product) use ($equivalentLinks, $directProductIds, $directProducts) {
                $link = $equivalentLinks->first(function (ProductEquivalent $link) use ($product, $directProductIds) {
                    return (
                        $link->equivalent_product_id === $product->id &&
                        $directProductIds->contains($link->base_product_id)
                    ) || (
                        $link->base_product_id === $product->id &&
                        $directProductIds->contains($link->equivalent_product_id)
                    );
                });

                $equivalentToProductId = null;

                if ($link) {
                    $equivalentToProductId = $link->base_product_id === $product->id
                        ? $link->equivalent_product_id
                        : $link->base_product_id;
                }

                $equivalentToProduct = $directProducts->firstWhere('id', $equivalentToProductId);

                return $this->formatProduct(
                    product: $product,
                    fitmentType: 'equivalent',
                    equivalentToProductId: $equivalentToProductId,
                    equivalentToProductName: $equivalentToProduct?->name,
                    equivalenceNotes: $link?->notes
                );
            });

        return response()->json(
            $directFormatted
                ->merge($equivalentFormatted)
                ->unique('id')
                ->values()
        );
    }

    public function store(
        StoreProductRequest $request,
        CreateProduct $createProduct,
        ProductImageUploader $imageUploader
    ): JsonResponse {
        $validated = $request->validated();

        if ($request->hasFile('image')) {
            try {
                $validated['image_path'] = $imageUploader->upload($request->file('image'));
            } catch (\Exception $e) {
                return response()->json([
                    'message' => $e->getMessage(),
                ], 422);
            }
        }

        // Do NOT unset car_variant_id.
        // CreateProductDTO uses it to create ProductVehicleCompatibility.
        $dto = CreateProductDTO::fromArray($validated);

        $product = $createProduct->execute($dto);

        return response()->json([
            'message' => 'Product created successfully.',
            'data' => $product,
        ], 201);
    }

    public function adjustStock(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'quantity_on_hand' => 'required|integer|min:0',
            'sell_price' => 'required|numeric|min:0',
        ]);

        $product = Product::findOrFail($id);

        $inventory = \App\Domains\Product\Domain\Models\Inventory::updateOrCreate(
            ['productID' => $product->id],
            [
                'quantity_on_hand' => $validated['quantity_on_hand'],
                'sell_price' => $validated['sell_price'],
                'location_id' => $request->input('location_id') ?? 'd3b07384-d113-4ec6-a55d-752007414777',
            ]
        );

        return response()->json([
            'message' => 'Stock adjusted successfully.',
            'data' => $this->formatProduct($product->fresh(['inventoryRelation'])),
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $product = Product::query()
            ->with([
                'category',
                'manufacturer',
                'unitRelation',
                'suppliers',
                'equivalentProducts',
                'equivalentToProducts',
                'inventoryRelation',
            ])
            ->where('id', $id)
            ->firstOrFail();

        return response()->json([
            'data' => $this->formatProduct($product),
        ]);
    }

    private function formatProduct(
        Product $product,
        string $fitmentType = 'unfiltered',
        ?string $equivalentToProductId = null,
        ?string $equivalentToProductName = null,
        ?string $equivalenceNotes = null
    ): array {
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

            'quantity_on_hand' => $product->inventoryRelation?->quantity_on_hand,
            'sell_price' => $product->inventoryRelation?->sell_price,

            'is_oem' => $product->is_oem,
            'oem_reference_number' => $product->oem_reference_number,

            'fitment_type' => $fitmentType,
            'equivalent_to_product_id' => $equivalentToProductId,
            'equivalent_to_product_name' => $equivalentToProductName,
            'equivalence_notes' => $equivalenceNotes,
        ];
    }
}