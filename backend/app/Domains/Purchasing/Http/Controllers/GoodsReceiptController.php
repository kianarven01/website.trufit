<?php

namespace App\Domains\Purchasing\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use App\Domains\Purchasing\Domain\Models\GoodsReceipt;
use App\Domains\Purchasing\Domain\Models\GoodsReceiptItem;
use App\Domains\Purchasing\Domain\Models\PurchaseOrder;
use App\Domains\Purchasing\Domain\Models\PurchaseOrderItem;
use App\Domains\Purchasing\Domain\Models\StockMovement;
use App\Domains\Inventory\Domain\Models\Inventory;

class GoodsReceiptController extends Controller
{
    private const DEFAULT_LOCATION_ID = 'd3b07384-d113-4ec6-a55d-752007414777';

    public function index(): JsonResponse
    {
        $receipts = GoodsReceipt::with(['purchaseOrder.supplier', 'items.product'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'goods_receipts' => $receipts,
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

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'purchase_order_id' => ['required', 'uuid'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.purchase_order_item_id' => ['required', 'uuid'],
            'items.*.quantity_received' => ['required', 'integer', 'min:0'],
            'items.*.quantity_rejected' => ['nullable', 'integer', 'min:0'],
            'items.*.notes' => ['nullable', 'string'],
        ]);

        $receipt = DB::transaction(function () use ($validated) {
            $purchaseOrder = PurchaseOrder::with('items.receiptItems')
                ->findOrFail($validated['purchase_order_id']);

            if (!in_array($purchaseOrder->status, ['APPROVED', 'PARTIALLY_RECEIVED'], true)) {
                abort(response()->json([
                    'message' => 'Goods receipt can only be created from an approved or partially received PO.',
                ], 422));
            }

            $receipt = GoodsReceipt::create([
                'receipt_number' => $this->generateReceiptNumber(),
                'purchase_order_id' => $purchaseOrder->id,
                'status' => 'DRAFT',
                'received_at' => now(),
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['items'] as $itemData) {
                $poItem = PurchaseOrderItem::with('receiptItems')
                    ->where('purchase_order_id', $purchaseOrder->id)
                    ->findOrFail($itemData['purchase_order_item_id']);

                $alreadyReceived = $poItem->receiptItems()
                    ->whereHas('goodsReceipt', function ($query) {
                        $query->where('status', 'APPROVED');
                    })
                    ->sum('quantity_received');

                $remaining = (int) $poItem->quantity_ordered - (int) $alreadyReceived;
                $quantityReceived = (int) $itemData['quantity_received'];

                if ($quantityReceived > $remaining) {
                    abort(response()->json([
                        'message' => 'Received quantity cannot exceed remaining quantity.',
                        'product_id' => $poItem->product_id,
                        'remaining' => $remaining,
                    ], 422));
                }

                GoodsReceiptItem::create([
                    'goods_receipt_id' => $receipt->id,
                    'purchase_order_item_id' => $poItem->id,
                    'product_id' => $poItem->product_id,
                    'product_supplier_id' => $poItem->product_supplier_id,
                    'quantity_received' => $quantityReceived,
                    'quantity_rejected' => $itemData['quantity_rejected'] ?? 0,
                    'notes' => $itemData['notes'] ?? null,
                ]);
            }

            return $receipt;
        });

        $receipt->load(['purchaseOrder.supplier', 'items.product', 'items.purchaseOrderItem']);

        return response()->json([
            'message' => 'Goods receipt draft created successfully.',
            'goods_receipt' => $receipt,
        ], 201);
    }

    public function approve(string $id): JsonResponse
    {
        $receipt = GoodsReceipt::with(['items', 'purchaseOrder.items.receiptItems.goodsReceipt'])
            ->findOrFail($id);

        if ($receipt->status !== 'DRAFT') {
            return response()->json([
                'message' => 'Only draft goods receipts can be approved.',
            ], 422);
        }

        DB::transaction(function () use ($receipt) {
            foreach ($receipt->items as $item) {
                if ($item->quantity_received <= 0) {
                    continue;
                }

                $inventory = Inventory::firstOrCreate(
                    [
                        'productID' => $item->product_id,
                        'product_supplier_id' => $item->product_supplier_id,
                        'location_id' => self::DEFAULT_LOCATION_ID,
                    ],
                    [
                        'quantity_on_hand' => 0,
                        'reserved_quantity' => 0,
                        'reorder_level' => 5,
                        'reorder_qty' => 10,
                        'sell_price' => null,
                    ]
                );

                $inventory->increment('quantity_on_hand', $item->quantity_received);

                StockMovement::create([
                    'inventory_id' => $inventory->id,
                    'product_id' => $item->product_id,
                    'product_supplier_id' => $item->product_supplier_id,
                    'movement_type' => 'IN_RECEIPT',
                    'quantity' => $item->quantity_received,
                    'reference_type' => 'GOODS_RECEIPT',
                    'reference_id' => $receipt->id,
                    'notes' => 'Goods receipt from PO ' . $receipt->purchaseOrder?->po_number,
                ]);
            }

            $receipt->update([
                'status' => 'APPROVED',
                'approved_at' => now(),
            ]);

            $this->updatePurchaseOrderReceiptStatus($receipt->purchaseOrder);
        });

        $receipt->refresh()->load(['purchaseOrder.supplier', 'items.product']);

        return response()->json([
            'message' => 'Goods receipt approved. Inventory updated successfully.',
            'goods_receipt' => $receipt,
        ]);
    }

    private function updatePurchaseOrderReceiptStatus(PurchaseOrder $purchaseOrder): void
    {
        $purchaseOrder->load('items.receiptItems.goodsReceipt');

        $allFullyReceived = true;
        $anyReceived = false;

        foreach ($purchaseOrder->items as $item) {
            $approvedReceived = $item->receiptItems
                ->filter(fn ($receiptItem) => $receiptItem->goodsReceipt?->status === 'APPROVED')
                ->sum('quantity_received');

            if ($approvedReceived > 0) {
                $anyReceived = true;
            }

            if ($approvedReceived < $item->quantity_ordered) {
                $allFullyReceived = false;
            }
        }

        if ($allFullyReceived) {
            $purchaseOrder->update([
                'status' => 'RECEIVED',
                'date_received' => now(),
            ]);
            return;
        }

        if ($anyReceived) {
            $purchaseOrder->update([
                'status' => 'PARTIALLY_RECEIVED',
            ]);
        }
    }

    private function generateReceiptNumber(): string
    {
        do {
            $receiptNumber = 'GR-' . now()->format('ymd') . '-' . random_int(1000, 9999);
        } while (GoodsReceipt::where('receipt_number', $receiptNumber)->exists());

        return $receiptNumber;
    }
}
