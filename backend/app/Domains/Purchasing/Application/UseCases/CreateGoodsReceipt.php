<?php

namespace App\Domains\Purchasing\Application\UseCases;

use App\Domains\Purchasing\Domain\Models\GoodsReceipt;
use App\Domains\Purchasing\Domain\Models\GoodsReceiptItem;
use App\Domains\Purchasing\Domain\Models\PurchaseOrder;
use App\Domains\Purchasing\Domain\Models\PurchaseOrderItem;
use App\Domains\Purchasing\Application\Services\ReceiptNumberService;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class CreateGoodsReceipt
{
    public function __construct(
        private readonly ReceiptNumberService $numberService
    ) {}

    public function execute(array $data, ?string $userId = null): GoodsReceipt
    {
        return DB::transaction(function () use ($data, $userId) {
            $purchaseOrder = PurchaseOrder::with('items.receiptItems')
                ->findOrFail($data['purchase_order_id']);

            if (!in_array($purchaseOrder->status, ['APPROVED', 'PARTIALLY_RECEIVED'], true)) {
                throw new RuntimeException('Goods receipt can only be created from an approved or partially received PO.', 422);
            }

            $receipt = GoodsReceipt::create([
                'receipt_number' => $this->numberService->generate(),
                'purchase_order_id' => $purchaseOrder->id,
                'status' => 'DRAFT',
                'received_at' => now(),
                'notes' => $data['notes'] ?? null,
                'received_by' => $userId,
            ]);

            $allowOverReceiving = $data['allow_over_receiving'] ?? false;

            foreach ($data['items'] as $itemData) {
                $poItem = PurchaseOrderItem::with('receiptItems')
                    ->where('purchase_order_id', $purchaseOrder->id)
                    ->findOrFail($itemData['purchase_order_item_id']);

                $alreadyReceived = $poItem->receiptItems()
                    ->whereHas('goodsReceipt', function ($query) {
                        $query->whereIn('status', ['APPROVED', 'PARTIALLY_RETURNED', 'RETURNED']);
                    })
                    ->selectRaw('SUM(quantity_received - quantity_returned) as total')
                    ->value('total') ?? 0;

                $remaining = (int) $poItem->quantity_ordered - (int) $alreadyReceived;
                $quantityReceived = (int) $itemData['quantity_received'];

                if (!$allowOverReceiving && $quantityReceived > $remaining) {
                    throw new RuntimeException("Received quantity cannot exceed remaining quantity ({$remaining}).", 422);
                }

                GoodsReceiptItem::create([
                    'goods_receipt_id' => $receipt->id,
                    'purchase_order_item_id' => $poItem->id,
                    'product_id' => $poItem->product_id,
                    'product_supplier_id' => $poItem->product_supplier_id,
                    'quantity_received' => $quantityReceived,
                    'quantity_rejected' => $itemData['quantity_rejected'] ?? 0,
                    'quantity_promo' => $itemData['quantity_promo'] ?? 0,
                    'notes' => $itemData['notes'] ?? null,
                ]);
            }

            return $receipt;
        });
    }
}
