<?php

namespace App\Domains\Supplier\Application\UseCases;

use App\Domains\Supplier\Domain\Models\Supplier;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class GetSupplierById
{
    public function execute($id)
    {
        $supplier = Supplier::with('products.manufacturer')->find($id);

        if (!$supplier) {
            throw new ModelNotFoundException('Supplier not found');
        }

        return $supplier;
    }
}
