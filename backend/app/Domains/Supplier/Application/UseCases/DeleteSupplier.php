<?php

namespace App\Domains\Supplier\Application\UseCases;

use App\Domains\Supplier\Domain\Models\Supplier;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class DeleteSupplier
{
    public function execute($id)
    {
        $supplier = Supplier::with('products')->find($id);

        if (!$supplier) {
            throw new ModelNotFoundException('Supplier not found');
        }

        if ($supplier->products->count() > 0) {
            throw new \Exception('Cannot delete supplier with linked products. Unlink all products first.');
        }

        return $supplier->delete();
    }
}
