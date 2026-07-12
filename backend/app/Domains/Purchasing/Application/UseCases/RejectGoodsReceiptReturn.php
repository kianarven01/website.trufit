<?php

namespace App\Domains\Purchasing\Application\UseCases;

use App\Domains\Purchasing\Domain\Models\GoodsReceipt;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class RejectGoodsReceiptReturn
{
    public function execute(string $goodsReceiptId, ?string $userId = null): GoodsReceipt
    {
        return DB::transaction(function () use ($goodsReceiptId, $userId) {
            $receipt = GoodsReceipt::lockForUpdate()->findOrFail($goodsReceiptId);

            if ($receipt->status !== 'RETURN_REQUESTED') {
                throw new RuntimeException('This goods receipt does not have a pending return request.', 422);
            }

            $receipt->load('items');
            $totalReturned = $receipt->items->sum('quantity_returned');

            if ($totalReturned > 0) {
                $newStatus = 'PARTIALLY_RETURNED';
            } else {
                $newStatus = 'RECEIVED';
            }

            $receipt->update([
                'status' => $newStatus,
                'return_request_items' => null,
                'return_requested_by' => null,
                'return_requested_at' => null,
            ]);

            return $receipt->fresh(['purchaseOrder.supplier', 'items.product', 'items.purchaseOrderItem']);
        });
    }
}
