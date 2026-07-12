<?php

namespace App\Domains\Purchasing\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Purchasing\Http\Controllers\Traits\HandlesUseCaseErrors;
use App\Domains\Purchasing\Application\Services\StockReceivingService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Domains\Purchasing\Domain\Models\PurchaseOrder;
use App\Domains\Purchasing\Domain\Models\PurchaseOrderItem;
use App\Domains\Purchasing\Domain\Models\GoodsReceipt;
use App\Domains\Purchasing\Domain\Models\GoodsReceiptItem;
use App\Domains\Purchasing\Domain\Models\SupplierBill;
use App\Domains\Purchasing\Domain\Models\SupplierBillItem;
use App\Domains\Purchasing\Domain\Models\StockMovement;
use App\Domains\Purchasing\Http\Requests\StorePurchaseOrderRequest;
use App\Domains\Purchasing\Http\Requests\UpdatePurchaseOrderRequest;
use App\Domains\Purchasing\Application\UseCases\CreatePurchaseOrder;
use App\Domains\Purchasing\Application\UseCases\SubmitPurchaseOrder;
use App\Domains\Purchasing\Application\UseCases\ApprovePurchaseOrder;
use App\Domains\Purchasing\Application\UseCases\ClosePurchaseOrder;
use App\Domains\Purchasing\Application\UseCases\ReopenPurchaseOrder;
use App\Domains\Purchasing\Application\UseCases\CancelPurchaseOrder;

class PurchaseOrderController extends Controller
{
    use HandlesUseCaseErrors;
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');
        $status = $request->query('status');
        $archived = $request->query('archived') === 'true' || $request->query('archived') == '1';
        $perPage = $this->clampPerPage($request->query('per_page', 10));

        $query = PurchaseOrder::with([
            'supplier',
            'items.product.manufacturer',
            'items.productSupplier',
            'items.receiptItems.goodsReceipt',
            'supplierBills.items',
            'createdByUser.employee',
            'submittedByUser.employee',
            'approvedByUser.employee',
            'cancelledByUser.employee'
        ]);

        if ($archived) {
            $query->onlyTrashed();
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('po_number', 'ILIKE', "%{$search}%")
                  ->orWhereHas('supplier', function ($sq) use ($search) {
                      $sq->where('CompanyName', 'ILIKE', "%{$search}%");
                  });
            });
        }

        if ($status && $status !== 'ALL') {
            $statuses = array_map('strtoupper', array_map('trim', explode(',', $status)));
            $query->whereIn('status', $statuses);
        }

        $paginated = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json([
            'purchase_orders' => $paginated->items(),
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
        $purchaseOrder = PurchaseOrder::with([
            'supplier',
            'items.product.manufacturer',
            'items.productSupplier',
            'items.receiptItems.goodsReceipt',
            'goodsReceipts.items',
            'supplierBills.items',
            'createdByUser.employee',
            'submittedByUser.employee',
            'approvedByUser.employee',
            'cancelledByUser.employee',
        ])->findOrFail($id);

        return response()->json([
            'purchase_order' => $purchaseOrder,
        ]);
    }

    public function store(StorePurchaseOrderRequest $request, CreatePurchaseOrder $createPurchaseOrder): JsonResponse
    {
        try {
            $purchaseOrder = $createPurchaseOrder->execute($request->validated(), $request->user()?->id);

            $purchaseOrder->load(['supplier', 'items.product.manufacturer', 'items.productSupplier', 'createdByUser.employee']);

            return response()->json([
                'message' => 'Purchase order draft created successfully.',
                'purchase_order' => $purchaseOrder,
            ], 201);
        } catch (\Exception $e) {
            return $this->handleUseCaseException($e, 'create purchase order');
        }
    }

    public function submit(string $id, Request $request, SubmitPurchaseOrder $submitPurchaseOrder): JsonResponse
    {
        try {
            $purchaseOrder = $submitPurchaseOrder->execute($id, $request->user()?->id);

            return response()->json([
                'message' => 'Purchase order submitted for approval.',
                'purchase_order' => $purchaseOrder,
            ]);
        } catch (\Exception $e) {
            return $this->handleUseCaseException($e, 'submit purchase order');
        }
    }

    public function approve(string $id, Request $request, ApprovePurchaseOrder $approvePurchaseOrder): JsonResponse
    {
        try {
            $purchaseOrder = $approvePurchaseOrder->execute($id, $request->user()?->id);

            return response()->json([
                'message' => 'Purchase order approved successfully.',
                'purchase_order' => $purchaseOrder,
            ]);
        } catch (\Exception $e) {
            return $this->handleUseCaseException($e, 'approve purchase order');
        }
    }

    public function cancel(string $id, Request $request, CancelPurchaseOrder $cancelPurchaseOrder): JsonResponse
    {
        try {
            $purchaseOrder = $cancelPurchaseOrder->execute($id, $request->user()?->id);

            return response()->json([
                'message' => 'Purchase order cancelled successfully. All linked draft receipts and bills have been voided, and stock has been reversed.',
                'purchase_order' => $purchaseOrder,
            ]);
        } catch (\Throwable $e) {
            return $this->handleUseCaseException($e, 'cancel purchase order');
        }
    }

    public function close(string $id, Request $request, ClosePurchaseOrder $closePurchaseOrder): JsonResponse
    {
        try {
            $purchaseOrder = $closePurchaseOrder->execute($id, $request->user()?->id);

            $purchaseOrder->load([
                'supplier',
                'items.product.manufacturer',
                'items.productSupplier',
                'items.receiptItems.goodsReceipt',
                'goodsReceipts.items',
                'createdByUser.employee',
                'submittedByUser.employee',
                'approvedByUser.employee',
                'cancelledByUser.employee',
            ]);

            return response()->json([
                'message' => 'Purchase order closed successfully.',
                'purchase_order' => $purchaseOrder,
            ]);
        } catch (\Exception $e) {
            return $this->handleUseCaseException($e, 'close purchase order');
        }
    }

    public function reopen(string $id, Request $request, ReopenPurchaseOrder $reopenPurchaseOrder): JsonResponse
    {
        try {
            $purchaseOrder = $reopenPurchaseOrder->execute($id, $request->user()?->id);

            $purchaseOrder->load([
                'supplier',
                'items.product.manufacturer',
                'items.productSupplier',
                'items.receiptItems.goodsReceipt',
                'goodsReceipts.items',
                'createdByUser.employee',
                'submittedByUser.employee',
                'approvedByUser.employee',
                'cancelledByUser.employee',
            ]);

            return response()->json([
                'message' => 'Purchase order reopened successfully.',
                'purchase_order' => $purchaseOrder,
            ]);
        } catch (\Exception $e) {
            return $this->handleUseCaseException($e, 'reopen purchase order');
        }
    }
    public function update(UpdatePurchaseOrderRequest $request, string $id): JsonResponse
    {
        $validated = $request->validated();
        $purchaseOrder = PurchaseOrder::findOrFail($id);

        if ($purchaseOrder->status !== 'DRAFT') {
            return response()->json([
                'message' => 'Only draft purchase orders can be edited.',
            ], 422);
        }

        DB::transaction(function () use ($purchaseOrder, $validated) {
            $purchaseOrder->update([
                'supplier_id' => $validated['supplier_id'] ?? $purchaseOrder->supplier_id,
                'order_date' => $validated['order_date'] ?? $purchaseOrder->order_date,
                'request_ship_date' => $validated['request_ship_date'] ?? $purchaseOrder->request_ship_date,
                'eta' => $validated['eta'] ?? $purchaseOrder->eta,
                'remarks' => $validated['remarks'] ?? $purchaseOrder->remarks,
            ]);

            if (isset($validated['items'])) {
                $purchaseOrder->items()->delete();

                $subtotal = 0;

                foreach ($validated['items'] as $item) {
                    $poItem = PurchaseOrderItem::create([
                        'purchase_order_id' => $purchaseOrder->id,
                        'product_id' => $item['product_id'],
                        'product_supplier_id' => $item['product_supplier_id'] ?? null,
                        'quantity_ordered' => $item['quantity_ordered'],
                        'unit_cost' => $item['unit_cost'],
                        'notes' => $item['notes'] ?? null,
                    ]);

                    $subtotal += (float) $poItem->line_total;
                }

                $purchaseOrder->update([
                    'subtotal' => $subtotal,
                    'total_amount' => $subtotal,
                ]);
            }
        });

        $purchaseOrder->load(['supplier', 'items.product.manufacturer', 'items.productSupplier']);

        return response()->json([
            'message' => 'Purchase order updated successfully.',
            'purchase_order' => $purchaseOrder,
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $purchaseOrder = PurchaseOrder::findOrFail($id);

        if (!in_array($purchaseOrder->status, ['DRAFT', 'CANCELLED'], true)) {
            return response()->json([
                'message' => 'Only draft or cancelled purchase orders can be archived.',
            ], 422);
        }

        // Check if there are any active (non-cancelled) goods receipts or (non-void) bills
        $hasActiveReceipts = $purchaseOrder->goodsReceipts()->where('status', '!=', 'CANCELLED')->exists();
        $hasActiveBills = $purchaseOrder->supplierBills()->where('status', '!=', 'VOID')->exists();

        if ($hasActiveReceipts || $hasActiveBills) {
            return response()->json([
                'message' => 'This purchase order cannot be archived because it has active goods receipts or supplier bills linked to it.',
            ], 422);
        }

        $purchaseOrder->delete();

        return response()->json([
            'message' => 'Purchase order archived successfully.',
        ]);
    }

    public function restore(string $id): JsonResponse
    {
        $purchaseOrder = PurchaseOrder::onlyTrashed()->findOrFail($id);
        $purchaseOrder->restore();

        return response()->json([
            'message' => 'Purchase order restored successfully.',
        ]);
    }

    public function forceDelete(string $id): JsonResponse
    {
        $purchaseOrder = PurchaseOrder::withTrashed()->findOrFail($id);

        if (!$purchaseOrder->trashed()) {
            return response()->json([
                'message' => 'Only archived purchase orders can be permanently deleted.',
            ], 422);
        }

        DB::transaction(function () use ($purchaseOrder) {
            $stockService = new StockReceivingService();

            $receiptIds = $purchaseOrder->goodsReceipts()->pluck('id');
            if ($receiptIds->isNotEmpty()) {
                // Reverse inventory for each approved receipt before deleting movements
                $receipts = GoodsReceipt::whereIn('id', $receiptIds)
                    ->whereIn('status', ['RECEIVED', 'PARTIALLY_RETURNED'])
                    ->get();
                foreach ($receipts as $receipt) {
                    $stockService->undoReceive($receipt);
                }

                StockMovement::where('reference_type', 'GOODS_RECEIPT')
                    ->whereIn('reference_id', $receiptIds)->delete();
                GoodsReceiptItem::whereIn('goods_receipt_id', $receiptIds)->delete();
                GoodsReceipt::whereIn('id', $receiptIds)->delete();
            }

            $billIds = $purchaseOrder->supplierBills()->pluck('id');
            if ($billIds->isNotEmpty()) {
                SupplierBillItem::whereIn('supplier_bill_id', $billIds)->delete();
                SupplierBill::whereIn('id', $billIds)->delete();
            }

            $purchaseOrder->items()->delete();
            $purchaseOrder->forceDelete();
        });

        return response()->json([
            'message' => 'Purchase order permanently deleted.',
        ]);
    }
}
