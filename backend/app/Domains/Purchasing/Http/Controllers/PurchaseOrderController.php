<?php

namespace App\Domains\Purchasing\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Domains\Purchasing\Domain\Models\PurchaseOrder;
use App\Domains\Purchasing\Domain\Models\PurchaseOrderItem;

class PurchaseOrderController extends Controller
{
    public function index(): JsonResponse
    {
        $purchaseOrders = PurchaseOrder::with(['supplier', 'items.product', 'items.productSupplier'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'purchase_orders' => $purchaseOrders,
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $purchaseOrder = PurchaseOrder::with([
            'supplier',
            'items.product',
            'items.productSupplier',
            'goodsReceipts.items',
        ])->findOrFail($id);

        return response()->json([
            'purchase_order' => $purchaseOrder,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'supplier_id' => ['required', 'uuid'],
            'order_date' => ['nullable', 'date'],
            'request_ship_date' => ['nullable', 'date'],
            'eta' => ['nullable', 'date'],
            'remarks' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'uuid'],
            'items.*.product_supplier_id' => ['nullable', 'uuid'],
            'items.*.quantity_ordered' => ['required', 'integer', 'min:1'],
            'items.*.unit_cost' => ['required', 'numeric', 'min:0'],
            'items.*.notes' => ['nullable', 'string'],
        ]);

        $purchaseOrder = DB::transaction(function () use ($validated) {
            $purchaseOrder = PurchaseOrder::create([
                'po_number' => $this->generatePoNumber(),
                'supplier_id' => $validated['supplier_id'],
                'order_date' => $validated['order_date'] ?? now(),
                'request_ship_date' => $validated['request_ship_date'] ?? null,
                'eta' => $validated['eta'] ?? null,
                'status' => 'DRAFT',
                'remarks' => $validated['remarks'] ?? null,
                'subtotal' => 0,
                'total_amount' => 0,
            ]);

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

            return $purchaseOrder;
        });

        $purchaseOrder->load(['supplier', 'items.product', 'items.productSupplier']);

        return response()->json([
            'message' => 'Purchase order draft created successfully.',
            'purchase_order' => $purchaseOrder,
        ], 201);
    }

    public function submit(string $id): JsonResponse
    {
        $purchaseOrder = PurchaseOrder::findOrFail($id);

        if ($purchaseOrder->status !== 'DRAFT') {
            return response()->json([
                'message' => 'Only draft purchase orders can be submitted.',
            ], 422);
        }

        $purchaseOrder->update([
            'status' => 'SUBMITTED',
            'submitted_at' => now(),
        ]);

        return response()->json([
            'message' => 'Purchase order submitted for approval.',
            'purchase_order' => $purchaseOrder,
        ]);
    }

    public function approve(string $id): JsonResponse
    {
        $purchaseOrder = PurchaseOrder::findOrFail($id);

        if ($purchaseOrder->status !== 'SUBMITTED') {
            return response()->json([
                'message' => 'Only submitted purchase orders can be approved.',
            ], 422);
        }

        $purchaseOrder->update([
            'status' => 'APPROVED',
            'approved_at' => now(),
        ]);

        return response()->json([
            'message' => 'Purchase order approved successfully.',
            'purchase_order' => $purchaseOrder,
        ]);
    }

    public function cancel(string $id): JsonResponse
    {
        $purchaseOrder = PurchaseOrder::findOrFail($id);

        if (in_array($purchaseOrder->status, ['RECEIVED', 'CANCELLED'], true)) {
            return response()->json([
                'message' => 'This purchase order cannot be cancelled.',
            ], 422);
        }

        $purchaseOrder->update([
            'status' => 'CANCELLED',
            'cancelled_at' => now(),
        ]);

        return response()->json([
            'message' => 'Purchase order cancelled successfully.',
            'purchase_order' => $purchaseOrder,
        ]);
    }

    private function generatePoNumber(): string
    {
        do {
            $poNumber = 'PO-' . now()->format('ymd') . '-' . random_int(1000, 9999);
        } while (PurchaseOrder::where('po_number', $poNumber)->exists());

        return $poNumber;
    }
}
