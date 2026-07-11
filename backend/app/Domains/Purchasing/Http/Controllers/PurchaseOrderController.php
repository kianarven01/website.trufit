<?php

namespace App\Domains\Purchasing\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Domains\Purchasing\Domain\Models\PurchaseOrder;
use App\Domains\Purchasing\Domain\Models\PurchaseOrderItem;
use App\Domains\Purchasing\Http\Requests\StorePurchaseOrderRequest;
use App\Domains\Purchasing\Http\Requests\UpdatePurchaseOrderRequest;
use App\Domains\Purchasing\Application\UseCases\CreatePurchaseOrder;
use App\Domains\Purchasing\Application\UseCases\SubmitPurchaseOrder;
use App\Domains\Purchasing\Application\UseCases\ApprovePurchaseOrder;
use App\Domains\Purchasing\Application\UseCases\ClosePurchaseOrder;
use App\Domains\Purchasing\Application\UseCases\ReopenPurchaseOrder;

class PurchaseOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');
        $status = $request->query('status');
        $perPage = (int) $request->query('per_page', 10);

        $query = PurchaseOrder::with(['supplier', 'items.product.manufacturer', 'items.productSupplier', 'items.receiptItems.goodsReceipt', 'createdByUser.employee', 'submittedByUser.employee', 'approvedByUser.employee', 'cancelledByUser.employee']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('po_number', 'ILIKE', "%{$search}%")
                  ->orWhereHas('supplier', function ($sq) use ($search) {
                      $sq->where('CompanyName', 'ILIKE', "%{$search}%");
                  });
            });
        }

        if ($status && $status !== 'ALL') {
            $query->where('status', strtoupper($status));
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
            return response()->json([
                'message' => 'Failed to create purchase order.',
                'error' => $e->getMessage(),
            ], 400);
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
        } catch (\RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], $e->getCode() ?: 400);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to submit purchase order.',
                'error' => $e->getMessage(),
            ], 400);
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
        } catch (\RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], $e->getCode() ?: 400);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to approve purchase order.',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    public function cancel(string $id, Request $request): JsonResponse
    {
        $purchaseOrder = PurchaseOrder::findOrFail($id);

        if (in_array($purchaseOrder->status, ['COMPLETED', 'CANCELLED'], true)) {
            return response()->json([
                'message' => 'This purchase order cannot be cancelled.',
            ], 422);
        }

        $purchaseOrder->update([
            'status' => 'CANCELLED',
            'cancelled_at' => now(),
            'cancelled_by' => $request->user()?->id,
        ]);

        return response()->json([
            'message' => 'Purchase order cancelled successfully.',
            'purchase_order' => $purchaseOrder,
        ]);
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
        } catch (\RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], $e->getCode() ?: 400);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to close purchase order.',
                'error' => $e->getMessage(),
            ], 400);
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
        } catch (\RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], $e->getCode() ?: 400);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to reopen purchase order.',
                'error' => $e->getMessage(),
            ], 400);
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
                    $lineTotal = (float) $item['quantity_ordered'] * (float) $item['unit_cost'];

                    PurchaseOrderItem::create([
                        'purchase_order_id' => $purchaseOrder->id,
                        'product_id' => $item['product_id'],
                        'product_supplier_id' => $item['product_supplier_id'] ?? null,
                        'quantity_ordered' => $item['quantity_ordered'],
                        'unit_cost' => $item['unit_cost'],
                        'line_total' => $lineTotal,
                        'notes' => $item['notes'] ?? null,
                    ]);

                    $subtotal += $lineTotal;
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

        if ($purchaseOrder->status !== 'DRAFT') {
            return response()->json([
                'message' => 'Only draft purchase orders can be deleted.',
            ], 422);
        }

        DB::transaction(function () use ($purchaseOrder) {
            $purchaseOrder->items()->delete();
            $purchaseOrder->delete();
        });

        return response()->json([
            'message' => 'Purchase order deleted successfully.',
        ]);
    }
}
