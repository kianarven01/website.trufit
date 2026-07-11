<?php

namespace App\Domains\Purchasing\Application\UseCases;

use App\Domains\Purchasing\Domain\Models\PurchaseOrder;
use RuntimeException;

class ClosePurchaseOrder
{
    public function execute(string $id, ?string $userId = null): PurchaseOrder
    {
        return \Illuminate\Support\Facades\DB::transaction(function () use ($id) {
            $purchaseOrder = PurchaseOrder::with('items.receiptItems.goodsReceipt')->findOrFail($id);

            if ($purchaseOrder->status !== 'PARTIALLY_RECEIVED') {
                throw new RuntimeException('Only partially received purchase orders can be closed.', 422);
            }

            $subtotal = 0;

            foreach ($purchaseOrder->items as $item) {
                // Calculate net received quantity for this item
                $netReceived = $item->receiptItems
                    ->filter(fn ($receiptItem) => in_array($receiptItem->goodsReceipt?->status ?? '', ['RECEIVED', 'PARTIALLY_RETURNED', 'RETURNED']))
                    ->sum(fn ($receiptItem) => (int) $receiptItem->quantity_received - (int) $receiptItem->quantity_returned);

                // Update the ordered quantity to match the net received quantity
                $item->update([
                    'quantity_ordered' => $netReceived,
                    'line_total' => $netReceived * (float) $item->unit_cost,
                ]);

                $subtotal += $netReceived * (float) $item->unit_cost;
            }

            $purchaseOrder->update([
                'status' => 'COMPLETED',
                'subtotal' => $subtotal,
                'total_amount' => $subtotal,
            ]);

            return $purchaseOrder;
        });
    }
}
