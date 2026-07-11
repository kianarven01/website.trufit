<?php

namespace App\Domains\Purchasing\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Domains\Purchasing\Domain\Models\GoodsReceipt;
use App\Domains\Purchasing\Http\Requests\StoreGoodsReceiptRequest;
use App\Domains\Purchasing\Http\Requests\UpdateGoodsReceiptRequest;
use App\Domains\Purchasing\Application\UseCases\CreateGoodsReceipt;
use App\Domains\Purchasing\Application\UseCases\UpdateGoodsReceipt;
use App\Domains\Purchasing\Application\UseCases\ReceiveGoodsReceipt;
use App\Domains\Purchasing\Application\UseCases\ApproveGoodsReceipt;
use App\Domains\Purchasing\Application\UseCases\ReturnGoodsReceiptItems;
use RuntimeException;
use Throwable;

class GoodsReceiptController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');
        $status = $request->query('status');
        $archived = $request->query('archived') === 'true' || $request->query('archived') == '1';
        $perPage = (int) $request->query('per_page', 10);

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
        ])->findOrFail($id);

        return response()->json([
            'goods_receipt' => $receipt,
        ]);
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
        } catch (RuntimeException $e) {
            $code = $e->getCode();
            $statusCode = is_numeric($code) && $code >= 100 && $code < 600 ? (int)$code : 422;
            return response()->json([
                'message' => $e->getMessage(),
            ], $statusCode);
        } catch (Throwable $e) {
            return response()->json([
                'message' => 'Failed to create goods receipt.',
                'error' => $e->getMessage(),
            ], 500);
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
        } catch (RuntimeException $e) {
            $status = $e->getCode();

            if (!in_array($status, [400, 404, 409, 422], true)) {
                $status = 400;
            }

            return response()->json([
                'message' => $e->getMessage(),
            ], $status);
        } catch (Throwable $e) {
            return response()->json([
                'message' => 'Failed to receive goods receipt.',
                'error' => $e->getMessage(),
            ], 500);
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
        } catch (RuntimeException $e) {
            $status = $e->getCode();

            if (!in_array($status, [400, 404, 409, 422], true)) {
                $status = 400;
            }

            return response()->json([
                'message' => $e->getMessage(),
            ], $status);
        } catch (Throwable $e) {
            return response()->json([
                'message' => 'Failed to approve goods receipt.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function cancel(string $id, Request $request): JsonResponse
    {
        $receipt = GoodsReceipt::findOrFail($id);

        if (!in_array($receipt->status, ['DRAFT', 'RECEIVED'], true)) {
            return response()->json([
                'message' => 'Only draft or received goods receipts can be cancelled.',
            ], 422);
        }

        $receipt->update([
            'status' => 'CANCELLED',
            'cancelled_at' => now(),
            'cancelled_by' => $request->user()?->id,
        ]);

        return response()->json([
            'message' => 'Goods receipt cancelled successfully.',
            'goods_receipt' => $receipt,
        ]);
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
        } catch (RuntimeException $e) {
            $code = $e->getCode();
            $statusCode = is_numeric($code) && $code >= 100 && $code < 600 ? (int)$code : 422;
            return response()->json([
                'message' => $e->getMessage(),
            ], $statusCode);
        } catch (Throwable $e) {
            return response()->json([
                'message' => 'Failed to process return items.',
                'error' => $e->getMessage(),
            ], 500);
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
        } catch (\RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], $e->getCode() ?: 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update goods receipt.',
                'error' => $e->getMessage(),
            ], 400);
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
            $receipt->items()->delete();
            $receipt->forceDelete();
        });

        return response()->json([
            'message' => 'Goods receipt permanently deleted.',
        ]);
    }
}
