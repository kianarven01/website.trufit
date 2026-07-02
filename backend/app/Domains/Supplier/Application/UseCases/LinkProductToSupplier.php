<?php

namespace App\Domains\Supplier\Application\UseCases;

use App\Domains\Supplier\Domain\Models\ProductSupplier;
use App\Domains\Product\Domain\Models\ProductPrice;
use App\Domains\Inventory\Domain\Models\Inventory;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class LinkProductToSupplier
{
    private const DEFAULT_LOCATION_ID = 'd3b07384-d113-4ec6-a55d-752007414777';

    public function execute($supplierId, $productId, $cost, $isVat = false, $vatPercent = null, $price = null, $markup = null)
    {
        return DB::transaction(function () use ($supplierId, $productId, $cost, $isVat, $vatPercent, $price, $markup) {
            // Check if relationship already exists
            $link = ProductSupplier::where('supplier_id', $supplierId)
                ->where('product_id', $productId)
                ->first();

            if ($link) {
                $link->supplier_cost = $cost;
                $link->is_vat = $isVat;
                $link->vat_percent = $isVat ? $vatPercent : null;
                $link->save();
            } else {
                $link = ProductSupplier::create([
                    'id' => Str::uuid()->toString(),
                    'supplier_id' => $supplierId,
                    'product_id' => $productId,
                    'supplier_cost' => $cost,
                    'is_vat' => $isVat,
                    'vat_percent' => $isVat ? $vatPercent : null,
                ]);
            }

            // Create or update ProductPrice
            $productPrice = ProductPrice::where('product_supplier_id', $link->id)->first();
            if ($productPrice) {
                $productPrice->Price = $price;
                $productPrice->Markup = $markup;
                $productPrice->save();
            } else {
                ProductPrice::create([
                    'id' => Str::uuid()->toString(),
                    'product_supplier_id' => $link->id,
                    'Price' => $price,
                    'Markup' => $markup,
                ]);
            }

            // Create Inventory
            Inventory::firstOrCreate(
                [
                    'productID' => $productId,
                    'product_supplier_id' => $link->id,
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

            return $link;
        });
    }
}
