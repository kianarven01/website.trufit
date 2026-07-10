<?php

namespace App\Domains\Purchasing\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Domains\Purchasing\Domain\Models\GoodsReceipt;
use App\Domains\Purchasing\Http\Requests\StoreGoodsReceiptRequest;
use App\Domains\Purchasing\Http\Requests\ApproveGoodsReceiptRequest;
use App\Domains\Purchasing\Application\UseCases\CreateGoodsReceipt;
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
        $perPage = (int) $request->query('per_page', 10);

        $query = GoodsReceipt::with(['purchaseOrder.supplier', 'items.product']);

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
            'items.product',
            'items.purchaseOrderItem',
        ])->findOrFail($id);

        return response()->json([
            'goods_receipt' => $receipt,
        ]);
    }

    public function store(StoreGoodsReceiptRequest $request, CreateGoodsReceipt $createGoodsReceipt): JsonResponse
    {
        try {
            $receipt = $createGoodsReceipt->execute($request->validated());

            $receipt->load(['purchaseOrder.supplier', 'items.product', 'items.purchaseOrderItem']);

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

    public function approve(string $id, ApproveGoodsReceipt $approveGoodsReceipt): JsonResponse
    {
        try {
            $receipt = $approveGoodsReceipt->execute($id);

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

    public function cancel(string $id): JsonResponse
    {
        $receipt = GoodsReceipt::findOrFail($id);

        if ($receipt->status !== 'DRAFT') {
            return response()->json([
                'message' => 'Only draft goods receipts can be cancelled.',
            ], 422);
        }

        $receipt->update([
            'status' => 'CANCELLED',
            'cancelled_at' => now(),
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
            $receipt = $returnGoodsReceiptItems->execute($id, $validated['items']);

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

    public function destroy(string $id): JsonResponse
    {
        $receipt = GoodsReceipt::findOrFail($id);

        if ($receipt->status !== 'DRAFT') {
            return response()->json([
                'message' => 'Only draft goods receipts can be deleted.',
            ], 422);
        }

        DB::transaction(function () use ($receipt) {
            $receipt->items()->delete();
            $receipt->delete();
        });

        return response()->json([
            'message' => 'Goods receipt deleted successfully.',
        ]);
    }
}
