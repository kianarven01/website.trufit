<?php

namespace App\Domains\Product\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Domains\Product\Domain\Models\Product;
use App\Domains\Product\Domain\Models\ProductEquivalentGroup;
use App\Domains\Product\Domain\Models\ProductEquivalentGroupItem;

class ProductEquivalentGroupController extends Controller
{
    public function index(string $productId): JsonResponse
    {
        $product = Product::findOrFail($productId);

        $groups = ProductEquivalentGroup::with([
            'items.product.manufacturer',
            'items.product.part',
            'items.product.category',
            'items.product.unitRelation',
            'items.product.inventoryRows',
        ])
            ->whereHas('items', function ($query) use ($productId) {
                $query->where('product_id', $productId);
            })
            ->get();

        return response()->json([
            'product_id' => $product->id,
            'groups' => $groups->map(function ($group) use ($productId) {
                return $this->formatGroup($group, $productId);
            })->values(),
        ]);
    }

    public function store(Request $request, string $productId): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'equivalent_product_ids' => ['nullable', 'array'],
            'equivalent_product_ids.*' => ['uuid'],
        ]);

        $baseProduct = Product::findOrFail($productId);

        if (empty($baseProduct->part_id)) {
            return response()->json([
                'message' => 'Product must have a part type before creating equivalent group.',
            ], 422);
        }

        $group = DB::transaction(function () use ($validated, $baseProduct) {
            $group = ProductEquivalentGroup::create([
                'name' => $validated['name'] ?: $baseProduct->name . ' Equivalent Group',
                'part_id' => $baseProduct->part_id,
                'notes' => $validated['notes'] ?? null,
            ]);

            ProductEquivalentGroupItem::firstOrCreate([
                'group_id' => $group->id,
                'product_id' => $baseProduct->id,
            ]);

            $equivalentProductIds = $validated['equivalent_product_ids'] ?? [];

            foreach ($equivalentProductIds as $equivalentProductId) {
                if ($equivalentProductId === $baseProduct->id) {
                    continue;
                }

                $equivalentProduct = Product::findOrFail($equivalentProductId);

                if ((int) $equivalentProduct->part_id !== (int) $group->part_id) {
                    abort(response()->json([
                        'message' => 'Equivalent product must have the same part type.',
                        'product' => [
                            'id' => $equivalentProduct->id,
                            'name' => $equivalentProduct->name,
                            'part_id' => $equivalentProduct->part_id,
                        ],
                    ], 422));
                }

                ProductEquivalentGroupItem::firstOrCreate([
                    'group_id' => $group->id,
                    'product_id' => $equivalentProduct->id,
                ]);
            }

            return $group;
        });

        $group->load([
            'items.product.manufacturer',
            'items.product.part',
            'items.product.category',
            'items.product.unitRelation',
            'items.product.inventoryRows',
        ]);

        return response()->json([
            'message' => 'Equivalent group created successfully.',
            'group' => $this->formatGroup($group, $baseProduct->id),
        ], 201);
    }

    public function candidates(Request $request, string $productId): JsonResponse
    {
        $product = Product::findOrFail($productId);

        if (empty($product->part_id)) {
            return response()->json([
                'products' => [],
            ]);
        }

        $search = trim((string) $request->query('search', ''));

        $query = Product::with([
            'manufacturer',
            'part',
            'category',
            'unitRelation',
            'inventoryRows',
        ])
            ->where('id', '!=', $product->id)
            ->where('part_id', $product->part_id);

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('SKU', 'ilike', "%{$search}%")
                    ->orWhere('part_number', 'ilike', "%{$search}%")
                    ->orWhere('barcode', 'ilike', "%{$search}%");
            });
        }

        $products = $query
            ->orderBy('name')
            ->limit(30)
            ->get()
            ->map(fn ($candidate) => $this->formatProduct($candidate))
            ->values();

        return response()->json([
            'products' => $products,
        ]);
    }

    public function addItem(Request $request, string $groupId): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'uuid'],
        ]);

        $group = ProductEquivalentGroup::findOrFail($groupId);
        $product = Product::findOrFail($validated['product_id']);

        if ((int) $product->part_id !== (int) $group->part_id) {
            return response()->json([
                'message' => 'Equivalent product must have the same part type as the group.',
            ], 422);
        }

        ProductEquivalentGroupItem::firstOrCreate([
            'group_id' => $group->id,
            'product_id' => $product->id,
        ]);

        $group->load([
            'items.product.manufacturer',
            'items.product.part',
            'items.product.category',
            'items.product.unitRelation',
            'items.product.inventoryRows',
        ]);

        return response()->json([
            'message' => 'Product added to equivalent group successfully.',
            'group' => $this->formatGroup($group),
        ]);
    }

    public function removeItem(string $groupId, string $productId): JsonResponse
    {
        $group = ProductEquivalentGroup::findOrFail($groupId);

        ProductEquivalentGroupItem::where('group_id', $group->id)
            ->where('product_id', $productId)
            ->delete();

        $remainingItems = ProductEquivalentGroupItem::where('group_id', $group->id)->count();

        if ($remainingItems === 0) {
            $group->delete();

            return response()->json([
                'message' => 'Product removed. Equivalent group deleted because it is empty.',
            ]);
        }

        $group->load([
            'items.product.manufacturer',
            'items.product.part',
            'items.product.category',
            'items.product.unitRelation',
            'items.product.inventoryRows',
        ]);

        return response()->json([
            'message' => 'Product removed from equivalent group successfully.',
            'group' => $this->formatGroup($group),
        ]);
    }

    private function formatGroup(ProductEquivalentGroup $group, ?string $currentProductId = null): array
    {
        $products = $group->items
            ->map(fn ($item) => $item->product)
            ->filter()
            ->map(fn ($product) => $this->formatProduct($product))
            ->values();

        return [
            'id' => $group->id,
            'name' => $group->name,
            'part_id' => $group->part_id,
            'notes' => $group->notes,
            'products' => $products,
            'equivalent_products' => $currentProductId
                ? $products->where('id', '!=', $currentProductId)->values()
                : $products,
            'created_at' => $group->created_at,
            'updated_at' => $group->updated_at,
        ];
    }

    private function formatProduct(Product $product): array
    {
        $totalStock = $product->inventoryRows
            ? $product->inventoryRows->sum(fn ($inventory) => (int) $inventory->quantity_on_hand)
            : 0;

        return [
            'id' => $product->id,
            'name' => $product->name,
            'SKU' => $product->SKU,
            'sku' => $product->SKU,
            'barcode' => $product->barcode,
            'part_number' => $product->part_number,
            'description' => $product->description,
            'image_path' => $product->image_path,
            'category_id' => $product->category_id,
            'part_id' => $product->part_id,
            'manufacturer_id' => $product->manufacturer_id,
            'unit' => $product->unit,

            'manufacturer' => $product->manufacturer?->name,
            'manufacturer_name' => $product->manufacturer?->name,
            'part' => $product->part?->name,
            'part_name' => $product->part?->name,
            'category' => $product->category?->name,
            'category_name' => $product->category?->name,
            'unit_name' => $product->unitRelation?->name,
            'unit_abbreviation' => $product->unitRelation?->abbreviation,

            'quantity_on_hand' => $totalStock,
            'stock_status' => $totalStock > 0 ? 'In Stock' : 'Out of Stock',
        ];
    }
}