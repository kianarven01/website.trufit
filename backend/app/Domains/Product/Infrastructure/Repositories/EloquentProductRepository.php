<?php

namespace App\Domains\Product\Infrastructure\Repositories;

use App\Domains\Product\Domain\Models\Product;
use App\Domains\Supplier\Domain\Models\ProductSupplier;
use App\Domains\Product\Domain\Models\ProductVehicleCompatibility;
use App\Domains\Product\Domain\Repositories\ProductRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EloquentProductRepository implements ProductRepositoryInterface
{
    public function create(array $productData, array $suppliers = [], ?array $compatibility = null): Product
    {
        return DB::transaction(function () use ($productData, $suppliers, $compatibility) {
            $productId = (string) Str::uuid();

            $product = Product::create([
                'id' => $productId,
                'name' => $productData['name'],
                'SKU' => $productData['SKU'] ?? $productData['sku'] ?? null,
                'description' => $productData['description'] ?? null,
                'image_path' => $productData['image_path'] ?? null,
                'category_id' => $productData['category_id'] ?? null,
                'barcode' => $productData['barcode'] ?? null,
                'part_number' => $productData['part_number'] ?? null,
                'is_oem' => $productData['is_oem'] ?? false,
                'oem_reference_number' => $productData['oem_reference_number'] ?? null,
                'unit' => $productData['unit'] ?? $productData['unit_id'] ?? null,
                'part_id' => $productData['part_id'] ?? null,
                'manufacturer_id' => $productData['manufacturer_id'] ?? null,
            ]);

            foreach ($suppliers as $supplier) {
                if (empty($supplier['supplier_id'])) {
                    continue;
                }

                ProductSupplier::create([
                    'id' => (string) Str::uuid(),
                    'product_id' => $productId,
                    'supplier_id' => $supplier['supplier_id'],
                    'supplier_cost' => $supplier['supplier_cost'] ?? null,
                    'is_vat' => $supplier['is_vat'] ?? false,
                    'vat_percent' => ($supplier['is_vat'] ?? false) ? ($supplier['vat_percent'] ?? null) : null,
                ]);
            }

            if ($compatibility && !empty($compatibility['car_variant_id'])) {
                ProductVehicleCompatibility::create([
                    'id' => (string) Str::uuid(),
                    'product_id' => $productId,
                    'car_variant_id' => $compatibility['car_variant_id'],
                    'notes' => $compatibility['notes'] ?? null,
                    'created_at' => now(),
                ]);
            }

            // Automatically create corresponding default Inventory row in the DB
            \App\Domains\Product\Domain\Models\Inventory::create([
                'productID' => $productId,
                'quantity_on_hand' => 15,
                'sell_price' => 750.00,
                'location_id' => 'd3b07384-d113-4ec6-a55d-752007414777',
                'reserved_quantity' => 0,
                'reorder_level' => 5,
                'reorder_qty' => 10,
            ]);

            return $product->fresh([
                'category',
                'manufacturer',
                'unitRelation',
                'suppliers',
                'vehicleCompatibilities',
                'inventoryRelation',
            ]);
        });
    }
}