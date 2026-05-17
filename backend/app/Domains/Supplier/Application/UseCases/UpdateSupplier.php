<?php

namespace App\Domains\Supplier\Application\UseCases;

use App\Domains\Supplier\Application\DTOs\SupplierDTO;
use App\Domains\Supplier\Domain\Models\Supplier;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class UpdateSupplier
{
    public function execute($id, SupplierDTO $dto)
    {
        $supplier = Supplier::find($id);

        if (!$supplier) {
            throw new ModelNotFoundException('Supplier not found');
        }

        $data = $dto->toArray();
        foreach ($data as $key => $value) {
            $supplier->{$key} = $value;
        }

        $supplier->save();

        return $supplier;
    }
}
