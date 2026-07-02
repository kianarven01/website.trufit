<?php

namespace App\Domains\Product\Infrastructure\Repositories;

use App\Domains\Product\Domain\Models\Product;
use App\Domains\Product\Domain\Models\Part;
use App\Domains\Supplier\Domain\Models\ProductSupplier;
use App\Domains\Product\Domain\Models\ProductVehicleCompatibility;
use App\Domains\Product\Domain\Repositories\ProductRepositoryInterface;
use App\Domains\Product\Domain\Models\ProductPrice;
use App\Domains\Inventory\Domain\Models\Inventory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EloquentProductRepository implements ProductRepositoryInterface
{
    public function create(array $productData, array $suppliers = [], ?array $compatibility = null): Product
    {
        return DB::transaction(function () use ($productData, $suppliers, $compatibility) {
            $productId = (string) Str::uuid();

            $categoryId = $productData['category_id'] ?? null;

            if (!empty($productData['part_id'])) {
                $categoryId = Part::query()
                    ->where('id', (int) $productData['part_id'])
                    ->value('category_id');
            }

            // Create the product
            $product = Product::create([
                'id' => $productId,
                'name' => $productData['name'],
                'SKU' => $productData['SKU'] ?? $productData['sku'] ?? null,
                'description' => $productData['description'] ?? null,
                'image_path' => $productData['image_path'] ?? null,
                'category_id' => $categoryId,
                'barcode' => $productData['barcode'] ?? $productData['SKU'] ?? $productData['sku'] ?? null,
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

                $productSupplierId = (string) Str::uuid();

                // Create the product-supplier relationship
                $productSupplier = ProductSupplier::create([
                    'id' => $productSupplierId,
                    'product_id' => $productId,
                    'supplier_id' => $supplier['supplier_id'],
                    'supplier_cost' => $supplier['supplier_cost'] ?? null,
                    'is_vat' => $supplier['is_vat'] ?? false,
                    'vat_percent' => $supplier['vat_percent'] ?? null,
                ]);

                $markup = $supplier['markup'] ?? null;
                $price = $supplier['price'] ?? null;

                if ($price === null && $markup !== null && isset($supplier['supplier_cost'])) {
                    $price = (float) $supplier['supplier_cost'] + ((float) $supplier['supplier_cost'] * ((float) $markup / 100));
                }
                // Create the product price record
                ProductPrice::create([
                    'id' => (string) Str::uuid(),
                    'ProductID' => $productId,
                    'product_supplier_id' => $productSupplier->id,
                    'supplier_id' => $supplier['supplier_id'],
                    'Price' => $price,
                    'Markup' => $markup,
                    'is_active' => true,
                    'effective_from' => now(),
                    'effective_until' => null,
                ]);

                Inventory::firstOrCreate(
                    [
                        'productID' => $productId,
                        'product_supplier_id' => $productSupplier->id,
                        'location_id' => 'd3b07384-d113-4ec6-a55d-752007414777',
                    ],
                    [
                        'quantity_on_hand' => 0,
                        'sell_price' => null,
                        'reserved_quantity' => 0,
                        'reorder_level' => 5,
                        'reorder_qty' => 10,
                    ]
                );

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

            #Create initial inventory record for the product is now moved to a dedicated use case in the Inventory domain
    
            return $product->fresh([
                'category',
                'manufacturer',
                'unitRelation',
                'suppliers',
                'vehicleCompatibilities',
                
            ]);
        });
    }
}