<?php

namespace App\Domains\Supplier\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Domains\Supplier\Application\UseCases\GetSuppliers;
use App\Domains\Supplier\Application\UseCases\GetSupplierById;
use App\Domains\Supplier\Application\UseCases\CreateSupplier;
use App\Domains\Supplier\Application\UseCases\UpdateSupplier;
use App\Domains\Supplier\Application\UseCases\DeleteSupplier;
use App\Domains\Supplier\Application\UseCases\LinkProductToSupplier;
use App\Domains\Supplier\Application\UseCases\UnlinkProductFromSupplier;
use App\Domains\Supplier\Application\UseCases\UpdateSupplierProductCost;
use App\Domains\Supplier\Application\DTOs\SupplierDTO;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class SupplierController extends Controller
{
    public function index(GetSuppliers $useCase): JsonResponse
    {
        $suppliers = $useCase->execute();

        return response()->json([
            'data' => $suppliers->map(function ($supplier) {
                return [
                    'id' => $supplier->id,
                    'supplierCode' => $supplier->supplier_code,
                    'name' => $supplier->CompanyName,
                    'email' => $supplier->Email,
                    'phone' => $supplier->ContactNumber,
                    'contactPerson' => $supplier->CompanyContact,
                    'viber' => $supplier->Viber,
                ];
            }),
        ]);
    }

    public function show($id, GetSupplierById $useCase): JsonResponse
    {
        try {
            $supplier = $useCase->execute($id);

            return response()->json([
                'data' => [
                    'id' => $supplier->id,
                    'name' => $supplier->CompanyName,
                    'companyName' => $supplier->CompanyName,
                    'companyContact' => $supplier->CompanyContact,
                    'email' => $supplier->Email,
                    'contactNumber' => $supplier->ContactNumber,
                    'viber' => $supplier->Viber,
                    'supplierCode' => $supplier->supplier_code,
                    'products' => $supplier->products->map(function ($product) {
                        return [
                            'id' => $product->id,
                            'name' => $product->product_name,
                            'partNumber' => $product->part_number,
                            'price' => $product->pivot->supplier_cost ?? 0,
                            'isVat' => $product->pivot->is_vat ?? false,
                            'vatPercent' => $product->pivot->vat_percent ?? null,
                            'stock' => $product->inventory->quantity ?? 0,
                        ];
                    })->values(),
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Supplier not found'], 404);
        }
    }

    public function store(Request $request, CreateSupplier $useCase): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contactPerson' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'viber' => 'nullable|string|max:50',
            'supplierCode' => 'nullable|string|max:50',
        ]);

        $dto = SupplierDTO::fromRequest($validated);
        $supplier = $useCase->execute($dto);

        return response()->json([
            'message' => 'Supplier created successfully',
            'data' => [
                'id' => $supplier->id,
                'name' => $supplier->CompanyName,
                'companyName' => $supplier->CompanyName,
                'companyContact' => $supplier->CompanyContact,
                'email' => $supplier->Email,
                'contactNumber' => $supplier->ContactNumber,
                'viber' => $supplier->Viber,
                'supplierCode' => $supplier->supplier_code,
            ],
        ], 201);
    }

    public function update(Request $request, $id, UpdateSupplier $useCase): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contactPerson' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'viber' => 'nullable|string|max:50',
            'supplierCode' => 'nullable|string|max:50',
        ]);

        try {
            $dto = SupplierDTO::fromRequest($validated);
            $supplier = $useCase->execute($id, $dto);

            return response()->json([
                'message' => 'Supplier updated successfully',
                'data' => [
                    'id' => $supplier->id,
                    'name' => $supplier->CompanyName,
                    'companyName' => $supplier->CompanyName,
                    'companyContact' => $supplier->CompanyContact,
                    'email' => $supplier->Email,
                    'contactNumber' => $supplier->ContactNumber,
                    'viber' => $supplier->Viber,
                    'supplierCode' => $supplier->supplier_code,
                ],
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Supplier not found'], 404);
        }
    }

    public function destroy($id, DeleteSupplier $useCase): JsonResponse
    {
        try {
            $useCase->execute($id);
            return response()->json(['message' => 'Supplier deleted successfully']);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Supplier not found'], 404);
        }
    }

    public function linkProduct(Request $request, $id, LinkProductToSupplier $useCase): JsonResponse
    {
        $validated = $request->validate([
            'productId' => 'required|uuid',
            'cost' => 'required|numeric|min:0',
            'isVat' => 'nullable|boolean',
            'vatPercent' => 'nullable|numeric|min:0|max:100',
        ]);

        $useCase->execute(
            $id,
            $validated['productId'],
            $validated['cost'],
            $validated['isVat'] ?? false,
            $validated['vatPercent'] ?? null
        );

        return response()->json(['message' => 'Product linked to supplier successfully']);
    }

    public function unlinkProduct($id, $productId, UnlinkProductFromSupplier $useCase): JsonResponse
    {
        try {
            $useCase->execute($id, $productId);
            return response()->json(['message' => 'Product unlinked from supplier successfully']);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Relationship not found'], 404);
        }
    }

    public function updateProductCost(Request $request, $id, $productId, UpdateSupplierProductCost $useCase): JsonResponse
    {
        $validated = $request->validate([
            'cost' => 'required|numeric|min:0',
            'isVat' => 'nullable|boolean',
            'vatPercent' => 'nullable|numeric|min:0|max:100',
        ]);

        try {
            $useCase->execute(
                $id,
                $productId,
                $validated['cost'],
                $validated['isVat'] ?? false,
                $validated['vatPercent'] ?? null
            );
            return response()->json(['message' => 'Product cost updated successfully']);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Relationship not found'], 404);
        }
    }
}