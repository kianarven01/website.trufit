<?php

namespace App\Domains\Supplier\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Supplier\Domain\Models\Supplier;

class SupplierController extends Controller
{
    public function index()
    {
        $suppliers = Supplier::query()
            ->select('id', 'CompanyName', 'supplier_code')
            ->orderBy('CompanyName')
            ->get();

        return response()->json([
            'data' => $suppliers,
        ]);
    }
}