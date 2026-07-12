<?php

namespace App\Domains\Purchasing\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Purchasing\Http\Controllers\Traits\HandlesUseCaseErrors;
use App\Domains\Purchasing\Application\Services\StockReceivingService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Domains\Purchasing\Domain\Models\GoodsReceipt;
use App\Domains\Purchasing\Domain\Models\StockMovement;
use App\Domains\Purchasing\Application\Services\PurchaseOrderStatusService;
use App\Domains\Purchasing\Http\Requests\StoreGoodsReceiptRequest;
use App\Domains\Purchasing\Http\Requests\UpdateGoodsReceiptRequest;
use App\Domains\Purchasing\Application\UseCases\CreateGoodsReceipt;
use App\Domains\Purchasing\Application\UseCases\UpdateGoodsReceipt;
use App\Domains\Purchasing\Application\UseCases\ReceiveGoodsReceipt;
use App\Domains\Purchasing\Application\UseCases\ApproveGoodsReceipt;
use App\Domains\Purchasing\Application\UseCases\ReturnGoodsReceiptItems;
use RuntimeException;
use App\Domains\Purchasing\Application\UseCases\RequestGoodsReceiptReturn;
use App\Domains\Purchasing\Application\UseCases\ApproveGoodsReceiptReturn;
use App\Domains\Purchasing\Application\UseCases\RejectGoodsReceiptReturn;
use Spatie\LaravelPdf\Facades\Pdf;

class GoodsReceiptController extends Controller
{
    use HandlesUseCaseErrors;
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');
        $status = $request->query('status');
        $archived = $request->query('archived') === 'true' || $request->query('archived') == '1';
        $perPage = $this->clampPerPage($request->query('per_page', 10));

        $query = GoodsReceipt::with(['purchaseOrder.supplier', 'items.product.manufacturer', 'createdByUser.employee', 'receivedByUser.employee', 'approvedByUser.employee', 'returnedByUser.employee', 'cancelledByUser.employee']);

        if ($archived) {
            $query->onlyTrashed();
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('receipt_number', 'ILIKE', "%{$search}%")
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
            'goods_receipts' => $paginated->items(),
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
        $receipt = GoodsReceipt::with([
            'purchaseOrder.supplier',
            'purchaseOrder.items.product.manufacturer',
            'purchaseOrder.items.receiptItems.goodsReceipt',
            'purchaseOrder.supplierBills.items',
            'items.product.manufacturer',
            'items.purchaseOrderItem',
            'createdByUser.employee',
            'receivedByUser.employee',
            'approvedByUser.employee',
            'returnedByUser.employee',
            'cancelledByUser.employee',
            'returnRequestedByUser.employee',
        ])->findOrFail($id);

        return response()->json([
            'goods_receipt' => $receipt,
        ]);
    }

    public function downloadPdf(string $id)
    {
        $receipt = GoodsReceipt::with([
            'purchaseOrder.supplier',
            'items.product',
            'items.purchaseOrderItem',
            'createdByUser.employee',
            'receivedByUser.employee',
            'approvedByUser.employee',
        ])->findOrFail($id);

        $filename = 'GR-' . ($receipt->receipt_number ?? str_pad(substr($receipt->id, 0, 8), 8, '0', STR_PAD_LEFT)) . '.pdf';

        return Pdf::view('pdfs.goods-receipt', [
            'receipt' => $receipt,
        ])->format('a4')->inline($filename);
    }

    public function store(StoreGoodsReceiptRequest $request, CreateGoodsReceipt $createGoodsReceipt): JsonResponse
    {
        try {
            $receipt = $createGoodsReceipt->execute($request->validated(), $request->user()?->id);

            $receipt->load(['purchaseOrder.supplier', 'items.product.manufacturer', 'items.purchaseOrderItem', 'createdByUser.employee', 'receivedByUser.employee']);

            return response()->json([
                'message' => 'Goods receipt draft created successfully.',
                'goods_receipt' => $receipt,
            ], 201);
        } catch (\Exception $e) {
            return $this->handleUseCaseException($e, 'create goods receipt');
        }
    }

    public function receive(string $id, Request $request, ReceiveGoodsReceipt $receiveGoodsReceipt): JsonResponse
    {
        try {
            $receipt = $receiveGoodsReceipt->execute($id, $request->user()?->id);

            $receipt->load(['purchaseOrder.supplier', 'items.product.manufacturer', 'items.purchaseOrderItem', 'createdByUser.employee', 'receivedByUser.employee']);

            return response()->json([
                'message' => 'Goods receipt marked as received successfully.',
                'goods_receipt' => $receipt,
            ]);
        } catch (\Exception $e) {
            return $this->handleUseCaseException($e, 'receive goods receipt');
        }
    }

    public function approve(string $id, Request $request, ApproveGoodsReceipt $approveGoodsReceipt): JsonResponse
    {
        try {
            $receipt = $approveGoodsReceipt->execute($id, $request->user()?->id);

            return response()->json([
                'message' => 'Goods receipt approved. Inventory updated successfully.',
                'goods_receipt' => $receipt,
            ]);
        } catch (\Exception $e) {
            return $this->handleUseCaseException($e, 'approve goods receipt');
        }
    }

    public function cancel(string $id, Request $request, PurchaseOrderStatusService $poStatusService): JsonResponse
    {
        try {
            $receipt = DB::transaction(function () use ($id, $request, $poStatusService) {
                $receipt = GoodsReceipt::with('purchaseOrder')->lockForUpdate()->findOrFail($id);

                if (!in_array($receipt->status, ['DRAFT', 'SUBMITTED'], true)) {
                    throw new RuntimeException('Only draft or submitted goods receipts can be cancelled.', 422);
                }

                $receipt->update([
                    'status' => 'CANCELLED',
                    'cancelled_at' => now(),
                    'cancelled_by' => $request->user()?->id,
                ]);

                if ($receipt->purchaseOrder) {
                    $poStatusService->updateReceiptStatus($receipt->purchaseOrder);
                }

                return $receipt;
            });

            return response()->json([
                'message' => 'Goods receipt cancelled successfully.',
                'goods_receipt' => $receipt,
            ]);
        } catch (\Exception $e) {
            return $this->handleUseCaseException($e, 'cancel goods receipt');
        }
    }

    public function returnItems(Request $request, string $id, ReturnGoodsReceiptItems $returnGoodsReceiptItems): JsonResponse
    {
        $validated = $request->validate([
            'items' => ['required', 'array'],
            'items.*.goods_receipt_item_id' => ['required', 'string'],
            'items.*.quantity_returned' => ['required', 'integer', 'min:1'],
            'items.*.notes' => ['nullable', 'string'],
        ]);

        try {
            $receipt = $returnGoodsReceiptItems->execute($id, $validated['items'], $request->user()?->id);

            return response()->json([
                'message' => 'Goods receipt items returned successfully. Stock ledger was updated.',
                'goods_receipt' => $receipt,
            ]);
        } catch (\Exception $e) {
            return $this->handleUseCaseException($e, 'process return items');
        }
    }

    public function requestReturn(Request $request, string $id, RequestGoodsReceiptReturn $useCase): JsonResponse
    {
        $validated = $request->validate([
            'items' => ['required', 'array'],
            'items.*.goods_receipt_item_id' => ['required', 'string'],
            'items.*.quantity_returned' => ['required', 'integer', 'min:1'],
            'items.*.notes' => ['nullable', 'string'],
        ]);

        try {
            $receipt = $useCase->execute($id, $validated['items'], $request->user()?->id);

            return response()->json([
                'message' => 'Return request submitted successfully. Awaiting approval.',
                'goods_receipt' => $receipt,
            ]);
        } catch (\Exception $e) {
            return $this->handleUseCaseException($e, 'request return');
        }
    }

    public function approveReturn(string $id, Request $request, ApproveGoodsReceiptReturn $useCase): JsonResponse
    {
        try {
            $result = $useCase->execute($id, $request->user()?->id);

            return response()->json([
                'message' => 'Return approved. Inventory updated successfully.',
                'goods_receipt' => $result['receipt'],
                'results' => $result['results'],
            ]);
        } catch (\Exception $e) {
            return $this->handleUseCaseException($e, 'approve return');
        }
    }

    public function rejectReturn(string $id, Request $request, RejectGoodsReceiptReturn $useCase): JsonResponse
    {
        try {
            $receipt = $useCase->execute($id, $request->user()?->id);

            return response()->json([
                'message' => 'Return request rejected.',
                'goods_receipt' => $receipt,
            ]);
        } catch (\Exception $e) {
            return $this->handleUseCaseException($e, 'reject return');
        }
    }

    public function update(UpdateGoodsReceiptRequest $request, string $id, UpdateGoodsReceipt $updateGoodsReceipt): JsonResponse
    {
        try {
            $receipt = $updateGoodsReceipt->execute($id, $request->validated(), $request->user()?->id);

            $receipt->load([
                'purchaseOrder.supplier',
                'purchaseOrder.items.product.manufacturer',
                'purchaseOrder.items.receiptItems.goodsReceipt',
                'purchaseOrder.supplierBills.items',
                'items.product.manufacturer',
                'items.productSupplier',
                'items.purchaseOrderItem',
                'createdByUser.employee',
                'receivedByUser.employee',
                'approvedByUser.employee',
                'returnedByUser.employee',
                'cancelledByUser.employee',
            ]);

            return response()->json([
                'message' => 'Goods receipt updated successfully.',
                'goods_receipt' => $receipt,
            ]);
        } catch (\Exception $e) {
            return $this->handleUseCaseException($e, 'update goods receipt');
        }
    }

    public function destroy(string $id): JsonResponse
    {
        $receipt = GoodsReceipt::findOrFail($id);

        if (!in_array($receipt->status, ['DRAFT', 'CANCELLED'], true)) {
            return response()->json([
                'message' => 'Only draft or cancelled goods receipts can be archived.',
            ], 422);
        }

        $receipt->delete();

        return response()->json([
            'message' => 'Goods receipt archived successfully.',
        ]);
    }

    public function restore(string $id): JsonResponse
    {
        $receipt = GoodsReceipt::onlyTrashed()->findOrFail($id);
        $receipt->restore();

        return response()->json([
            'message' => 'Goods receipt restored successfully.',
        ]);
    }

    public function forceDelete(string $id): JsonResponse
    {
        $receipt = GoodsReceipt::withTrashed()->findOrFail($id);

        if (!$receipt->trashed()) {
            return response()->json([
                'message' => 'Only archived goods receipts can be permanently deleted.',
            ], 422);
        }

        DB::transaction(function () use ($receipt) {
            // Reverse inventory before deleting movements
            if (in_array($receipt->status, ['RECEIVED', 'PARTIALLY_RETURNED'], true)) {
                $stockService = new StockReceivingService();
                $stockService->undoReceive($receipt);
            }

            StockMovement::where('reference_type', 'GOODS_RECEIPT')
                ->where('reference_id', $receipt->id)->delete();
            $receipt->items()->delete();
            $receipt->forceDelete();
        });

        return response()->json([
            'message' => 'Goods receipt permanently deleted.',
        ]);
    }
}
