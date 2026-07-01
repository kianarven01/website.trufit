<?php

namespace App\Domains\Product\Application\Services;

use App\Domains\Product\Domain\Models\Product;
use App\Domains\Product\Domain\Models\ProductEquivalentGroupItem;
use Illuminate\Support\Collection;

class ProductQueryService
{
    public function __construct(private ProductFormatterService $formatter)
    {
    }

    public function listProducts(?string $variantId = null, ?string $categoryId = null): Collection
    {
        $baseQuery = Product::query()->with($this->productRelations());

        if ($categoryId) {
            $baseQuery->where('category_id', $categoryId);
        }

        if (!$variantId) {
            return $baseQuery
                ->orderBy('name')
                ->get()
                ->map(fn (Product $product) => $this->formatter->format($product, 'unfiltered'))
                ->values();
        }

        $directProducts = (clone $baseQuery)
            ->whereHas('vehicleCompatibilities', function ($query) use ($variantId) {
                $query->where('car_variant_id', $variantId);
            })
            ->orderBy('name')
            ->get();

        $directProductIds = $directProducts->pluck('id')->values();

        if ($directProductIds->isEmpty()) {
            return collect();
        }

        $groupIds = ProductEquivalentGroupItem::query()
            ->whereIn('product_id', $directProductIds)
            ->pluck('group_id')
            ->unique()
            ->values();

        $equivalentProducts = collect();
        $allGroupItems = collect();

        if ($groupIds->isNotEmpty()) {
            $allGroupItems = ProductEquivalentGroupItem::query()
                ->with('group')
                ->whereIn('group_id', $groupIds)
                ->get();

            $equivalentProductIds = $allGroupItems
                ->pluck('product_id')
                ->unique()
                ->reject(fn ($id) => $directProductIds->contains($id))
                ->values();

            if ($equivalentProductIds->isNotEmpty()) {
                $equivalentProducts = Product::query()
                    ->with($this->productRelations())
                    ->whereIn('id', $equivalentProductIds)
                    ->when($categoryId, fn ($query) => $query->where('category_id', $categoryId))
                    ->orderBy('name')
                    ->get();
            }
        }

        $directFormatted = $directProducts
            ->map(fn (Product $product) => $this->formatter->format($product, 'direct'));

        $equivalentFormatted = $equivalentProducts
            ->map(function (Product $product) use ($allGroupItems, $directProductIds, $directProducts) {
                $productGroupItem = $allGroupItems->firstWhere('product_id', $product->id);
                $directGroupItem = $allGroupItems
                    ->where('group_id', $productGroupItem?->group_id)
                    ->first(fn ($item) => $directProductIds->contains($item->product_id));

                $equivalentToProduct = $directProducts->firstWhere('id', $directGroupItem?->product_id);

                return $this->formatter->format(
                    product: $product,
                    fitmentType: 'equivalent',
                    equivalentToProductId: $equivalentToProduct?->id,
                    equivalentToProductName: $equivalentToProduct?->name,
                    equivalenceNotes: $productGroupItem?->group?->notes
                );
            });

        return $directFormatted
            ->merge($equivalentFormatted)
            ->unique('id')
            ->values();
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
            'inventoryRelation',
            'inventoryRows.productSupplier.supplier',
            'inventoryRows.productSupplier.price',
            'vehicleCompatibilities.vehicleVariant',
        ];
    }
}
