<?php

namespace App\Domains\Supplier\Application\UseCases;

use App\Domains\Supplier\Domain\Models\ProductSupplier;
use Illuminate\Support\Str;

class LinkProductToSupplier
{
    public function execute($supplierId, $productId, $cost, $isVat = false, $vatPercent = null)
    {
        // Check if relationship already exists
        $link = ProductSupplier::where('supplier_id', $supplierId)
            ->where('product_id', $productId)
            ->first();

        if ($link) {
            $link->supplier_cost = $cost;
            $link->is_vat = $isVat;
            $link->vat_percent = $isVat ? $vatPercent : null;
            $link->save();
            return $link;
        }

        return ProductSupplier::create([
            'id' => Str::uuid()->toString(),
            'supplier_id' => $supplierId,
            'product_id' => $productId,
            'supplier_cost' => $cost,
            'is_vat' => $isVat,
            'vat_percent' => $isVat ? $vatPercent : null,
        ]);
    }
}
