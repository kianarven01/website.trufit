<?php

namespace App\Domains\Purchasing\Application\Services;

use App\Domains\Purchasing\Domain\Models\PurchaseOrder;

class PurchaseOrderStatusService
{
    public function updateReceiptStatus(PurchaseOrder $purchaseOrder): void
    {
        $purchaseOrder->load('items.receiptItems.goodsReceipt');

        $allFullyReceived = true;
        $anyReceived = false;

        foreach ($purchaseOrder->items as $item) {
            $approvedReceived = $item->receiptItems
                ->filter(fn ($receiptItem) => in_array($receiptItem->goodsReceipt?->status ?? '', ['APPROVED', 'PARTIALLY_RETURNED', 'RETURNED']))
                ->map(fn ($receiptItem) => (int) $receiptItem->quantity_received - (int) $receiptItem->quantity_returned)
                ->sum();

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
        } else {
            $purchaseOrder->update([
                'status' => 'APPROVED',
            ]);
        }
    }
}
