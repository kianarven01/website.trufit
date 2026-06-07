<?php

namespace App\Domains\Supplier\Application\UseCases;

use App\Domains\Supplier\Application\DTOs\SupplierDTO;
use App\Domains\Supplier\Domain\Models\Supplier;

class CreateSupplier
{
    public function execute(SupplierDTO $dto)
    {
        $supplier = new Supplier();
        $supplier->supplier_code = $dto->supplierCode ?? $this->generateCode($dto->name);
        
        $data = $dto->toArray();
        foreach ($data as $key => $value) {
            $supplier->{$key} = $value;
        }

        $supplier->save();

        return $supplier;
    }

    private function generateCode(string $name): string
    {
        return 'SUP-' . strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $name), 0, 3)) . rand(100, 999);
    }
}
