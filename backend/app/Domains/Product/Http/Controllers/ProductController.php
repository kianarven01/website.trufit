<?php

namespace App\Domains\Product\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Product\Application\DTO\ArchiveProductDTO;
use App\Domains\Product\Application\DTO\CreateProductDTO;
use App\Domains\Product\Application\DTO\UpdateProductDTO;
use App\Domains\Product\Application\Services\ProductFormatterService;
use App\Domains\Product\Application\Services\ProductImageUploader;
use App\Domains\Product\Application\Services\ProductQueryService;
use App\Domains\Product\Application\Services\ProductSkuService;
use App\Domains\Product\Application\UseCases\ArchiveProduct;
use App\Domains\Product\Application\UseCases\CreateProduct;
use App\Domains\Product\Application\UseCases\UpdateProduct;
use App\Domains\Product\Domain\Models\Part;
use App\Domains\Product\Domain\Models\Product;
use App\Domains\Product\Http\Requests\StoreProductRequest;
use App\Domains\Product\Http\Requests\UpdateProductRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use App\Domains\Inventory\Domain\Models\Inventory;
use App\Domains\Supplier\Domain\Models\ProductSupplier;
use RuntimeException;
use Throwable;

class ProductController extends Controller
{
    public function __construct(
        private ProductFormatterService $formatter,
        private ProductQueryService $productQueryService,
        private ProductSkuService $skuService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $products = $this->productQueryService->listProducts(
            variantId: $request->query('variant_id'),
            categoryId: $request->query('category_id')
        );

        return response()->json($products);
    }

    public function store(
        StoreProductRequest $request,
        CreateProduct $createProduct,
        ProductImageUploader $imageUploader
    ): JsonResponse {
        $validated = $request->validated();

        if (!isset($validated['item_type']) || empty($validated['item_type'])) {
            $validated['item_type'] = 'part';
        }

        if (!empty($validated['part_id'])) {
            $part = Part::query()
                ->where('id', (int) $validated['part_id'])
                ->firstOrFail();

            $validated['category_id'] = $part->category_id;
        }

        if (
            $validated['item_type'] === 'part' &&
            empty($validated['SKU']) &&
            !empty($validated['manufacturer_id']) &&
            !empty($validated['part_id'])
        ) {
            $validated['SKU'] = $this->skuService->generate(
                (int) $validated['manufacturer_id'],
                (int) $validated['part_id']
            );
        }

        if (empty($validated['barcode']) && !empty($validated['SKU'])) {
            $validated['barcode'] = $validated['SKU'];
        }

        if (!empty($validated['barcode'])) {
            $barcodeExists = Product::query()
                ->where('barcode', $validated['barcode'])
                ->exists();

            if ($barcodeExists) {
                return response()->json([
                    'message' => 'The barcode has already been taken.',
                    'errors' => [
                        'barcode' => ['The barcode has already been taken.'],
                    ],
                ], 422);
            }
        }

        if ($request->hasFile('image')) {
            try {
                $validated['image_path'] = $imageUploader->upload($request->file('image'));
            } catch (\Exception $e) {
                return response()->json([
                    'message' => $e->getMessage(),
                ], 422);
            }
        }

        $dto = CreateProductDTO::fromArray($validated);
        $product = $createProduct->execute($dto);

        $product->load($this->productRelations());

        return response()->json([
            'message' => 'Product created successfully.',
            'data' => $this->formatter->format($product),
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $product = Product::query()
            ->with($this->productRelations())
            ->where('id', $id)
            ->firstOrFail();

        return response()->json([
            'data' => $this->formatter->format($product),
        ]);
    }

    public function update(
        string $id,
        UpdateProductRequest $request,
        UpdateProduct $updateProduct,
        ProductImageUploader $imageUploader
    ): JsonResponse {
        try {
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

            $product = $updateProduct->execute(
                UpdateProductDTO::fromArray($id, $validated)
            );

            $product->load($this->productRelations());

            return response()->json([
                'message' => 'Product updated successfully.',
                'data' => $this->formatter->format($product),
            ]);
        } catch (RuntimeException $e) {
            $status = $e->getCode();

            if (!in_array($status, [400, 404, 409, 422], true)) {
                $status = 400;
            }

            return response()->json([
                'message' => $e->getMessage(),
            ], $status);
        } catch (Throwable $e) {
            return response()->json([
                'message' => 'Failed to update product.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function archive(string $id, ArchiveProduct $archiveProduct): JsonResponse
    {
        try {
            $result = $archiveProduct->execute(
                ArchiveProductDTO::fromId($id)
            );

            return response()->json([
                'message' => 'Product archived successfully.',
                'data' => $result,
            ]);
        } catch (RuntimeException $e) {
            $status = $e->getCode();

            if (!in_array($status, [400, 404, 409, 422], true)) {
                $status = 400;
            }

            return response()->json([
                'message' => $e->getMessage(),
            ], $status);
        } catch (Throwable $e) {
            return response()->json([
                'message' => 'Failed to archive product.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function forceDelete(string $id): JsonResponse
    {
        try {
            $product = Product::withTrashed()->findOrFail($id);

            $isSystemSundries = $product->category && $product->category->is_spol && strtolower($product->category->name) === 'sundries';

            if (!$isSystemSundries) {
                $stockSummary = Inventory::query()
                    ->where('productID', $id)
                    ->selectRaw('COALESCE(SUM(quantity_on_hand), 0) as quantity_on_hand')
                    ->selectRaw('COALESCE(SUM(reserved_quantity), 0) as reserved_quantity')
                    ->first();

                $quantityOnHand = (int) ($stockSummary->quantity_on_hand ?? 0);
                $reservedQuantity = (int) ($stockSummary->reserved_quantity ?? 0);

                if ($quantityOnHand > 0 || $reservedQuantity > 0) {
                    return response()->json([
                        'message' => 'Product cannot be deleted because it still has stock or reserved quantity.',
                    ], 409);
                }

                $hasSuppliers = ProductSupplier::where('product_id', $id)->exists();
                if ($hasSuppliers) {
                    return response()->json([
                        'message' => 'Product cannot be deleted because it still has linked suppliers. Remove all suppliers first.',
                    ], 409);
                }
            }

            DB::transaction(function () use ($product) {
                $productId = $product->id;

                $supplierIds = DB::table('Main.ProductSuppliers')
                    ->where('product_id', $productId)
                    ->pluck('id');

                if ($supplierIds->isNotEmpty()) {
                    DB::table('Main.ProductPrice')
                        ->whereIn('product_supplier_id', $supplierIds)->delete();
                }

                DB::table('Main.Inventory')->where('productID', $productId)->delete();
                DB::table('Main.ProductSuppliers')->where('product_id', $productId)->delete();
                DB::table('Main.ProductEquivalentGroupItems')->where('product_id', $productId)->delete();
                DB::table('Main.AttributeValue')->where('productID', $productId)->delete();

                $product->forceDelete();
            });

            return response()->json([
                'message' => 'Product permanently deleted.',
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Product not found.'], 404);
        } catch (Throwable $e) {
            return response()->json([
                'message' => 'Failed to delete product.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function restore(string $id): JsonResponse
    {
        try {
            $product = Product::onlyTrashed()->findOrFail($id);
            $product->restore();

            return response()->json([
                'message' => 'Product restored successfully.',
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Product not found.'], 404);
        } catch (Throwable $e) {
            return response()->json([
                'message' => 'Failed to restore product.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function parts(Request $request): JsonResponse
    {
        $categoryId = $request->query('category_id');

        $parts = Part::query()
            ->with('category')
            ->when($categoryId, fn ($query) => $query->where('category_id', $categoryId))
            ->orderBy('name')
            ->get()
            ->map(fn ($part) => [
                'id' => $part->id,
                'name' => $part->name,
                'description' => $part->description,
                'category_id' => $part->category_id,
                'category_name' => $part->category?->name,
                'code' => $part->code,
            ])
            ->values();

        return response()->json([
            'data' => $parts,
        ]);
    }

    private function productRelations(): array
    {
        return [
            'category',
            'manufacturer',
            'unitRelation',
            'part',
            'productSuppliers.supplier',
            'productSuppliers.price',
            'productSuppliers.inventory',
            'preferredSupplier.supplier',
            'preferredSupplier.price',
            'preferredSupplier.inventory',
            'vehicleCompatibilities.vehicleVariant',
        ];
    }
}
