<?php

namespace App\Domains\Purchasing\Application\UseCases;

use App\Domains\Purchasing\Domain\Models\SupplierBill;
use App\Domains\Purchasing\Domain\Models\SupplierBillItem;
use App\Domains\Purchasing\Domain\Models\PurchaseOrder;
use App\Domains\Purchasing\Domain\Models\PurchaseOrderItem;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class CreateSupplierBill
{
    public function execute(array $data, ?string $userId = null): SupplierBill
    {
        return DB::transaction(function () use ($data, $userId) {
            $purchaseOrder = PurchaseOrder::with('items.receiptItems.goodsReceipt')
                ->findOrFail($data['purchase_order_id']);

            if (!in_array($purchaseOrder->status, ['WAITING_TO_RECEIVE', 'PARTIALLY_RECEIVED', 'COMPLETED', 'CLOSED'], true)) {
                throw new RuntimeException('Supplier bills can only be created for active, completed, or closed purchase orders.', 422);
            }

            $exists = SupplierBill::where('purchase_order_id', $purchaseOrder->id)
                ->where('bill_number', $data['bill_number'])
                ->exists();

            if ($exists) {
                throw new RuntimeException("Invoice number '{$data['bill_number']}' has already been recorded for this Purchase Order.", 422);
            }

            $bill = SupplierBill::create([
                'bill_number' => $data['bill_number'],
                'purchase_order_id' => $purchaseOrder->id,
                'status' => 'DRAFT',
                'bill_date' => $data['bill_date'],
                'due_date' => $data['due_date'],
                'total_amount' => 0,
                'notes' => $data['notes'] ?? null,
                'created_by' => $userId,
            ]);

            // Pre-index PO items to avoid N+1 queries
            $poItemsById = $purchaseOrder->items->keyBy('id');
            $poItemIds = $poItemsById->keys()->all();

            // Pre-calculate already billed quantities
            $alreadyBilledByPoItem = SupplierBillItem::whereIn('purchase_order_item_id', $poItemIds)
                ->whereHas('bill', fn ($q) => $q->where('status', '!=', 'VOID'))
                ->select('purchase_order_item_id', DB::raw('SUM(quantity_billed) as total'))
                ->groupBy('purchase_order_item_id')
                ->pluck('total', 'purchase_order_item_id');

            $totalAmount = 0;
            $hasDiscrepancy = false;

            foreach ($data['items'] as $itemData) {
                $poItem = $poItemsById->get($itemData['purchase_order_item_id']);

                if (!$poItem) {
                    throw new RuntimeException("Purchase order item not found: {$itemData['purchase_order_item_id']}", 422);
                }

                $netReceived = $poItem->receiptItems
                    ->filter(fn ($ri) => in_array($ri->goodsReceipt?->status, ['RECEIVED', 'PARTIALLY_RETURNED'], true))
                    ->sum(fn ($ri) => $ri->quantity_received - $ri->quantity_returned);

                $alreadyBilled = $alreadyBilledByPoItem->get($poItem->id, 0);

                $maxBilled = (int) $netReceived - (int) $alreadyBilled;
                $quantityBilled = (int) $itemData['quantity_billed'];
                $unitPrice = (float) $itemData['unit_price'];

                if ($quantityBilled > $maxBilled) {
                    $hasDiscrepancy = true;
                }

                if (abs($unitPrice - (float)$poItem->unit_cost) > 0.01) {
                    $hasDiscrepancy = true;
                }

                $lineTotal = $quantityBilled * $unitPrice;
                $totalAmount += $lineTotal;

                SupplierBillItem::create([
                    'supplier_bill_id' => $bill->id,
                    'purchase_order_item_id' => $poItem->id,
                    'product_id' => $poItem->product_id,
                    'quantity_billed' => $quantityBilled,
                    'unit_price' => $unitPrice,
                    'line_total' => $lineTotal,
                ]);
            }

            $status = $hasDiscrepancy ? 'MATCH_EXCEPTION' : 'AWAITING_PAYMENT';

            $bill->update([
                'status' => $status,
                'total_amount' => $totalAmount,
            ]);

            return $bill->fresh('items');
        });
    }
}
