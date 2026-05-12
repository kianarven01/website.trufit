<?php

namespace App\Domains\Supplier\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Supplier\Domain\Models\Supplier;
use Illuminate\Http\JsonResponse;

class SupplierController extends Controller
{
    public function index(): JsonResponse
    {
        $suppliers = Supplier::query()
            ->select([
                'id',
                'CompanyName',
                'CompanyContact',
                'Email',
                'ContactNumber',
                'Viber',
                'supplier_code',
            ])
            ->orderBy('CompanyName')
            ->get()
            ->map(function ($supplier) {
                return [
                    'id' => $supplier->id,
                    'name' => $supplier->CompanyName,
                    'companyName' => $supplier->CompanyName,
                    'companyContact' => $supplier->CompanyContact,
                    'email' => $supplier->Email,
                    'contactNumber' => $supplier->ContactNumber,
                    'viber' => $supplier->Viber,
                    'supplierCode' => $supplier->supplier_code,
                ];
            });

        return response()->json([
            'data' => $suppliers,
        ]);
    }
}