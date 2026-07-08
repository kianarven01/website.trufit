<?php

namespace App\Domains\Product\Application\Services;

use App\Domains\Inventory\Domain\Models\Inventory;
use App\Domains\Product\Domain\Models\Product;
use App\Domains\Product\Domain\Models\ProductPrice;
use App\Domains\Supplier\Domain\Models\ProductSupplier;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductSupplierService
{
    private const DEFAULT_LOCATION_ID = 'd3b07384-d113-4ec6-a55d-752007414777';

    public function addSupplier(Product $product, array $data): Product
    {
        return DB::transaction(function () use ($product, $data) {
            $productSupplier = ProductSupplier::create([
                'id' => (string) Str::uuid(),
                'product_id' => $product->id,
                'supplier_id' => $data['supplier_id'],
                'supplier_cost' => $data['supplier_cost'] ?? null,
                'is_vat' => $data['is_vat'] ?? false,
                'vat_percent' => $data['vat_percent'] ?? null,
            ]);

            // Set as preferred if this is the first supplier
            if (!$product->preferred_supplier_id) {
                $product->update(['preferred_supplier_id' => $productSupplier->id]);
            }

            ProductPrice::create([
                'id' => (string) Str::uuid(),
                'product_supplier_id' => $productSupplier->id,
                'Price' => $data['price'] ?? null,
                'Markup' => $data['markup'] ?? null,
            ]);

            Inventory::firstOrCreate(
                [
                    'productID' => $product->id,
                    'product_supplier_id' => $productSupplier->id,
                    'location_id' => self::DEFAULT_LOCATION_ID,
                ],
                [
                    'quantity_on_hand' => 0,
                    'sell_price' => null,
                    'reserved_quantity' => 0,
                    'reorder_level' => 5,
                    'reorder_qty' => 10,
                ]
            );

            return $product->fresh([
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
            ]);
        });
    }

    public function removeSupplier(Product $product, string $productSupplierId): Product
    {
        return DB::transaction(function () use ($product, $productSupplierId) {
            $productSupplier = ProductSupplier::where('product_id', $product->id)
                ->findOrFail($productSupplierId);

            $hasStockOrReserved = DB::table('Main.Inventory')
                ->where('product_supplier_id', $productSupplierId)
                ->where(function ($query) {
                    $query->where('quantity_on_hand', '>', 0)
                        ->orWhere('reserved_quantity', '>', 0);
                })
                ->exists();

            if ($hasStockOrReserved) {
                throw new \Exception("Cannot remove supplier. There is active stock or reserved quantity associated with this supplier.");
            }

            // Clean up inventory rows linked to this supplier
            DB::table('Main.Inventory')
                ->where('product_supplier_id', $productSupplierId)
                ->delete();

            // Clean up price rows linked to this supplier
            DB::table('Main.ProductPrice')
                ->where('product_supplier_id', $productSupplierId)
                ->delete();

            // Delete the supplier link
            $productSupplier->delete();

            return $product->fresh([
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
            ]);
        });
    }
}
