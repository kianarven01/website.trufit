<?php

namespace App\Domains\Supplier\Application\UseCases;

use App\Domains\Supplier\Domain\Models\ProductSupplier;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class UnlinkProductFromSupplier
{
    public function execute($supplierId, $productId)
    {
        $link = ProductSupplier::where('supplier_id', $supplierId)
            ->where('product_id', $productId)
            ->first();

        if (!$link) {
            throw new ModelNotFoundException('Relationship not found');
        }

        return $link->delete();
    }
}
