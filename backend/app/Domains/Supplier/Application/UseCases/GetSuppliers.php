<?php

namespace App\Domains\Supplier\Application\UseCases;

use App\Domains\Supplier\Domain\Models\Supplier;

class GetSuppliers
{
    public function execute()
    {
        return Supplier::select([
            'id', 
            'supplier_code', 
            'CompanyName', 
            'CompanyContact', 
            'Email', 
            'ContactNumber', 
            'Viber'
        ])
            ->orderBy('CompanyName')
            ->get();
    }
}