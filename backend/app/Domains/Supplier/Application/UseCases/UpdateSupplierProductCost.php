<?php

namespace App\Domains\Supplier\Application\UseCases;

use App\Domains\Supplier\Domain\Models\ProductSupplier;
use App\Domains\Product\Domain\Models\ProductPrice;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class UpdateSupplierProductCost
{
    public function execute($supplierId, $productId, $cost, $isVat = false, $vatPercent = null, $price = null, $markup = null)
    {
        return DB::transaction(function () use ($supplierId, $productId, $cost, $isVat, $vatPercent, $price, $markup) {
            $link = ProductSupplier::where('supplier_id', $supplierId)
                ->where('product_id', $productId)
                ->first();

            if (!$link) {
                throw new ModelNotFoundException('Relationship not found');
            }

            $link->supplier_cost = $cost;
            $link->is_vat = $isVat;
            $link->vat_percent = $isVat ? $vatPercent : null;
            $link->save();

            // Update associated price
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

            return $link;
        });
    }
}
