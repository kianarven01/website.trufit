<?php

namespace App\Domains\Purchasing\Application\UseCases;

use App\Domains\Purchasing\Application\Services\PurchaseOrderStatusService;
use App\Domains\Purchasing\Application\Services\StockReceivingService;
use App\Domains\Purchasing\Domain\Models\GoodsReceipt;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ApproveGoodsReceipt
{
    public function __construct(
        private readonly StockReceivingService $stockReceivingService,
        private readonly PurchaseOrderStatusService $purchaseOrderStatusService,
    ) {
    }

    public function execute(string $goodsReceiptId, ?string $userId = null): GoodsReceipt
    {
        return DB::transaction(function () use ($goodsReceiptId, $userId) {
            $receipt = GoodsReceipt::with([
                'items',
                'purchaseOrder.items.receiptItems.goodsReceipt',
            ])
                ->lockForUpdate()
                ->find($goodsReceiptId);

            if (!$receipt) {
                throw new RuntimeException('Goods receipt not found.', 404);
            }

            if (in_array($receipt->status, ['RECEIVED', 'PARTIALLY_RETURNED', 'RETURNED'], true)) {
                throw new RuntimeException('Goods receipt is already approved.', 409);
            }

            if (!in_array($receipt->status, ['DRAFT', 'SUBMITTED'], true)) {
                throw new RuntimeException('Only draft or submitted goods receipts can be approved.', 422);
            }

            if ($receipt->items->isEmpty()) {
                throw new RuntimeException('Goods receipt has no items to approve.', 422);
            }

            $this->stockReceivingService->receiveGoods($receipt);

            $updateData = [
                'status' => 'RECEIVED',
                'approved_at' => now(),
                'approved_by' => $userId,
            ];

            if ($receipt->status === 'DRAFT') {
                $updateData['received_by'] = $userId;
                $updateData['received_at'] = now();
            }

            $receipt->update($updateData);

            $this->purchaseOrderStatusService->updateReceiptStatus(
                $receipt->purchaseOrder
            );

            return $receipt->fresh([
                'purchaseOrder.supplier',
                'items.product',
                'items.purchaseOrderItem',
            ]);
        });
    }
}