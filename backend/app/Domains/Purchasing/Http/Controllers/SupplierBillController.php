<?php

namespace App\Domains\Purchasing\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Purchasing\Http\Controllers\Traits\HandlesUseCaseErrors;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Domains\Purchasing\Domain\Models\SupplierBill;
use App\Domains\Purchasing\Http\Requests\StoreSupplierBillRequest;
use App\Domains\Purchasing\Application\UseCases\CreateSupplierBill;
use App\Domains\Purchasing\Application\UseCases\ApproveSupplierBill;
use App\Domains\Purchasing\Application\UseCases\PaySupplierBill;
use Illuminate\Support\Facades\DB;

class SupplierBillController extends Controller
{
    use HandlesUseCaseErrors;
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');
        $status = $request->query('status');
        $archived = $request->query('archived') === 'true' || $request->query('archived') == '1';
        $perPage = $this->clampPerPage($request->query('per_page', 10));

        $query = SupplierBill::with([
            'purchaseOrder.supplier',
            'createdByUser.employee',
            'approvedByUser.employee',
            'paidByUser.employee'
        ]);

        if ($archived) {
            $query->onlyTrashed();
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('bill_number', 'ILIKE', "%{$search}%")
                  ->orWhereHas('purchaseOrder', function ($pq) use ($search) {
                      $pq->where('po_number', 'ILIKE', "%{$search}%")
                        ->orWhereHas('supplier', function ($sq) use ($search) {
                            $sq->where('CompanyName', 'ILIKE', "%{$search}%");
                        });
                  });
            });
        }

        if ($status && $status !== 'ALL') {
            $query->where('status', strtoupper($status));
        }

        $paginated = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json([
            'supplier_bills' => $paginated->items(),
            'pagination' => [
                'total' => $paginated->total(),
                'per_page' => $paginated->perPage(),
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
            ]
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $bill = SupplierBill::with([
            'purchaseOrder.supplier',
            'items.purchaseOrderItem.receiptItems.goodsReceipt',
            'items.product.manufacturer',
            'createdByUser.employee',
            'approvedByUser.employee',
            'paidByUser.employee'
        ])->findOrFail($id);

        return response()->json([
            'supplier_bill' => $bill,
        ]);
    }

    public function store(StoreSupplierBillRequest $request, CreateSupplierBill $createSupplierBill): JsonResponse
    {
        try {
            $bill = $createSupplierBill->execute($request->validated(), $request->user()?->id);

            $bill->load([
                'purchaseOrder.supplier',
                'items.purchaseOrderItem.receiptItems.goodsReceipt',
                'items.product.manufacturer',
                'createdByUser.employee',
            ]);

            return response()->json([
                'message' => 'Supplier bill recorded successfully.',
                'supplier_bill' => $bill,
            ]);
        } catch (\Exception $e) {
            return $this->handleUseCaseException($e, 'create supplier bill');
        }
    }

    public function approve(string $id, Request $request, ApproveSupplierBill $approveSupplierBill): JsonResponse
    {
        try {
            $bill = $approveSupplierBill->execute($id, $request->user()?->id);

            $bill->load([
                'purchaseOrder.supplier',
                'items.purchaseOrderItem.receiptItems.goodsReceipt',
                'items.product.manufacturer',
                'createdByUser.employee',
                'approvedByUser.employee',
            ]);

            return response()->json([
                'message' => 'Supplier bill approved/overridden successfully.',
                'supplier_bill' => $bill,
            ]);
        } catch (\Exception $e) {
            return $this->handleUseCaseException($e, 'approve supplier bill');
        }
    }

    public function pay(string $id, Request $request, PaySupplierBill $paySupplierBill): JsonResponse
    {
        try {
            $bill = $paySupplierBill->execute($id, $request->user()?->id);

            $bill->load([
                'purchaseOrder.supplier',
                'items.purchaseOrderItem.receiptItems.goodsReceipt',
                'items.product.manufacturer',
                'createdByUser.employee',
                'approvedByUser.employee',
                'paidByUser.employee',
            ]);

            return response()->json([
                'message' => 'Supplier bill payment recorded successfully.',
                'supplier_bill' => $bill,
            ]);
        } catch (\Exception $e) {
            return $this->handleUseCaseException($e, 'record supplier bill payment');
        }
    }

    public function void(string $id, Request $request): JsonResponse
    {
        try {
            $bill = DB::transaction(function () use ($id, $request) {
                $bill = SupplierBill::lockForUpdate()->findOrFail($id);

                if ($bill->status === 'VOID') {
                    throw new RuntimeException('This supplier bill is already voided.', 422);
                }

                $bill->update([
                    'status' => 'VOID',
                    'voided_by' => $request->user()?->id,
                    'voided_at' => now(),
                ]);

                return $bill;
            });

            $bill->load([
                'purchaseOrder.supplier',
                'items.purchaseOrderItem.receiptItems.goodsReceipt',
                'items.product.manufacturer',
                'createdByUser.employee',
                'approvedByUser.employee',
                'paidByUser.employee',
                'voidedByUser.employee',
            ]);

            return response()->json([
                'message' => 'Supplier bill voided successfully.',
                'supplier_bill' => $bill,
            ]);
        } catch (\Exception $e) {
            return $this->handleUseCaseException($e, 'void supplier bill');
        }
    }

    public function destroy(string $id): JsonResponse
    {
        $bill = SupplierBill::findOrFail($id);

        if (!in_array($bill->status, ['DRAFT', 'VOID'], true)) {
            return response()->json([
                'message' => 'Only draft or void supplier bills can be archived.',
            ], 422);
        }

        $bill->delete();

        return response()->json([
            'message' => 'Supplier bill archived successfully.',
        ]);
    }

    public function restore(string $id): JsonResponse
    {
        $bill = SupplierBill::onlyTrashed()->findOrFail($id);
        $bill->restore();

        return response()->json([
            'message' => 'Supplier bill restored successfully.',
        ]);
    }

    public function forceDelete(string $id): JsonResponse
    {
        $bill = SupplierBill::withTrashed()->findOrFail($id);

        if (!$bill->trashed()) {
            return response()->json([
                'message' => 'Only archived supplier bills can be permanently deleted.',
            ], 422);
        }

        DB::transaction(function () use ($bill) {
            $bill->items()->delete();
            $bill->forceDelete();
        });

        return response()->json([
            'message' => 'Supplier bill permanently deleted.',
        ]);
    }
}
