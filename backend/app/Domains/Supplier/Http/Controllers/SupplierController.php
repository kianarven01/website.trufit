<?php

namespace App\Domains\Supplier\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Supplier\Application\UseCases\GetSuppliers;

class SupplierController extends Controller
{
    public function index(GetSuppliers $getSuppliers)
    {
        $suppliers = $getSuppliers->execute();

        return response()->json([
            'data' => $suppliers
        ]);
    }
}