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

    public function execute(string $goodsReceiptId): GoodsReceipt
    {
        return DB::transaction(function () use ($goodsReceiptId) {
            $receipt = GoodsReceipt::with([
                'items',
                'purchaseOrder.items.receiptItems.goodsReceipt',
            ])
                ->lockForUpdate()
                ->find($goodsReceiptId);

            if (!$receipt) {
                throw new RuntimeException('Goods receipt not found.', 404);
            }

            if ($receipt->status === 'APPROVED') {
                throw new RuntimeException('Goods receipt is already approved.', 409);
            }

            if ($receipt->status !== 'DRAFT') {
                throw new RuntimeException('Only draft goods receipts can be approved.', 422);
            }

            if ($receipt->items->isEmpty()) {
                throw new RuntimeException('Goods receipt has no items to approve.', 422);
            }

            $this->stockReceivingService->receiveGoods($receipt);

            $receipt->update([
                'status' => 'APPROVED',
                'approved_at' => now(),
            ]);

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