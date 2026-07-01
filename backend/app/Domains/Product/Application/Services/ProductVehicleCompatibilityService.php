<?php

namespace App\Domains\Product\Application\Services;

use App\Domains\Product\Domain\Models\Product;
use App\Domains\Product\Domain\Models\ProductEquivalentGroupItem;
use App\Domains\Product\Domain\Models\ProductVehicleCompatibility;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ProductVehicleCompatibilityService
{
    public function addCompatibility(Product $product, array $data): array
    {
        return DB::transaction(function () use ($product, $data) {
            $createdCount = 0;
            $equivalentCreatedCount = 0;

            $mainCompatibility = ProductVehicleCompatibility::firstOrCreate(
                [
                    'product_id' => $product->id,
                    'car_variant_id' => $data['car_variant_id'],
                ],
                [
                    'notes' => $data['notes'] ?? null,
                ]
            );

            if ($mainCompatibility->wasRecentlyCreated) {
                $createdCount++;
            }

            if (!empty($data['apply_to_equivalents'])) {
                foreach ($this->getEquivalentProductIds($product->id) as $equivalentProductId) {
                    $compatibility = ProductVehicleCompatibility::firstOrCreate(
                        [
                            'product_id' => $equivalentProductId,
                            'car_variant_id' => $data['car_variant_id'],
                        ],
                        [
                            'notes' => $data['notes'] ?? null,
                        ]
                    );

                    if ($compatibility->wasRecentlyCreated) {
                        $equivalentCreatedCount++;
                    }
                }
            }

            return [
                'created_count' => $createdCount,
                'equivalent_created_count' => $equivalentCreatedCount,
            ];
        });
    }

    public function syncToEquivalents(Product $product): array
    {
        $sourceCompatibilities = ProductVehicleCompatibility::where('product_id', $product->id)->get();

        if ($sourceCompatibilities->isEmpty()) {
            return [
                'message' => 'This product has no vehicle compatibility records to sync.',
                'synced_count' => 0,
            ];
        }

        $equivalentProductIds = $this->getEquivalentProductIds($product->id);

        if ($equivalentProductIds->isEmpty()) {
            return [
                'message' => 'This product has no equivalent products to sync with.',
                'synced_count' => 0,
            ];
        }

        $syncedCount = 0;

        DB::transaction(function () use ($sourceCompatibilities, $equivalentProductIds, &$syncedCount) {
            foreach ($equivalentProductIds as $equivalentProductId) {
                foreach ($sourceCompatibilities as $compatibility) {
                    $newCompatibility = ProductVehicleCompatibility::firstOrCreate(
                        [
                            'product_id' => $equivalentProductId,
                            'car_variant_id' => $compatibility->car_variant_id,
                        ],
                        [
                            'notes' => $compatibility->notes,
                        ]
                    );

                    if ($newCompatibility->wasRecentlyCreated) {
                        $syncedCount++;
                    }
                }
            }
        });

        return [
            'message' => 'Vehicle compatibility synced successfully.',
            'synced_count' => $syncedCount,
        ];
    }

    public function getEquivalentProductIds(string $productId): Collection
    {
        $groupIds = ProductEquivalentGroupItem::where('product_id', $productId)
            ->pluck('group_id');

        if ($groupIds->isEmpty()) {
            return collect();
        }

        return ProductEquivalentGroupItem::whereIn('group_id', $groupIds)
            ->where('product_id', '!=', $productId)
            ->pluck('product_id')
            ->unique()
            ->values();
    }
}
