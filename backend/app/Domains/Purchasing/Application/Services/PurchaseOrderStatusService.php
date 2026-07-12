<?php

namespace App\Domains\Purchasing\Application\Services;

use App\Domains\Purchasing\Domain\Models\PurchaseOrder;

class PurchaseOrderStatusService
{
    public function updateReceiptStatus(PurchaseOrder $purchaseOrder): void
    {
        if ($purchaseOrder->status === 'CANCELLED') {
            return;
        }

        $purchaseOrder->load('items.receiptItems.goodsReceipt');

        $allFullyReceived = true;
        $totalReceived = 0;
        $totalReturned = 0;
        $receivedAmount = 0;

        foreach ($purchaseOrder->items as $item) {
            $received = $item->receiptItems
                ->filter(fn ($receiptItem) => in_array($receiptItem->goodsReceipt?->status ?? '', ['RECEIVED', 'PARTIALLY_RETURNED', 'RETURNED']))
                ->sum(fn ($receiptItem) => (int) $receiptItem->quantity_received);

            $returned = $item->receiptItems
                ->filter(fn ($receiptItem) => in_array($receiptItem->goodsReceipt?->status ?? '', ['RECEIVED', 'PARTIALLY_RETURNED', 'RETURNED']))
                ->sum(fn ($receiptItem) => (int) $receiptItem->quantity_returned);

            $totalReceived += $received;
            $totalReturned += $returned;

            $netReceived = $received - $returned;
            $receivedAmount += $netReceived * (float) $item->unit_cost;

            if ($netReceived < $item->quantity_ordered) {
                $allFullyReceived = false;
            }
        }

        // Always persist received_amount (including for CLOSED POs)
        $purchaseOrder->update([
            'received_amount' => round($receivedAmount, 2),
        ]);

        $overallNet = $totalReceived - $totalReturned;

        if ($purchaseOrder->status === 'CLOSED') {
            return;
        }

        if ($totalReceived > 0 && $overallNet == 0) {
            $purchaseOrder->update([
                'status' => 'RETURNED',
            ]);
            return;
        }

        if ($overallNet == 0) {
            $purchaseOrder->update([
                'status' => 'WAITING_TO_RECEIVE',
            ]);
            return;
        }

        if ($allFullyReceived) {
            $purchaseOrder->update([
                'status' => 'COMPLETED',
                'date_received' => now(),
            ]);
        } else {
            $purchaseOrder->update([
                'status' => 'PARTIALLY_RECEIVED',
            ]);
        }
    }
}
