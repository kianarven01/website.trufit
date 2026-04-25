<?php

namespace App\Domains\Product\Infrastructure\Repositories;

use App\Domains\Product\Domain\Models\Product;
use App\Domains\Product\Domain\Models\ProductSupplier;
use App\Domains\Product\Domain\Models\ProductVehicleCompatibility;
use App\Domains\Product\Domain\Repositories\ProductRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EloquentProductRepository implements ProductRepositoryInterface
{
    public function create(array $productData, array $suppliers = [], ?array $compatibility = null): Product
    {
        return DB::transaction(function () use ($productData, $suppliers, $compatibility) {
            $product = Product::create([
                'id' => (string) Str::uuid(),
                ...$productData,
            ]);

            foreach ($suppliers as $supplier) {
                if (empty($supplier['supplier_id'])) {
                    continue;
                }

                ProductSupplier::create([
                    'id' => (string) Str::uuid(),
                    'product_id' => $product->id,
                    'supplier_id' => $supplier['supplier_id'],
                    'supplier_cost' => $supplier['supplier_cost'] ?? null,
                ]);
            }

            if ($compatibility) {
                ProductVehicleCompatibility::create([
                    'id' => (string) Str::uuid(),
                    'product_id' => $product->id,
                    'car_variant_id' => $compatibility['car_variant_id'],
                    'notes' => $compatibility['notes'] ?? null,
                    'created_at' => now(),
                ]);
            }

            return $product->load([
                'category',
                'manufacturer',
                'unitRelation',
                'suppliers',
                'vehicleCompatibilities',
            ]);
        });
    }
}