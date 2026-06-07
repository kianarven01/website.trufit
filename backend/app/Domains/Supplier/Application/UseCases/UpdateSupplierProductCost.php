<?php

namespace App\Domains\Supplier\Application\UseCases;

use App\Domains\Supplier\Domain\Models\ProductSupplier;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class UpdateSupplierProductCost
{
    public function execute($supplierId, $productId, $cost, $isVat = false, $vatPercent = null)
    {
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

        return $link;
    }
}
