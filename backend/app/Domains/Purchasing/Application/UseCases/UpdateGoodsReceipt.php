<?php

namespace App\Domains\Purchasing\Application\UseCases;

use App\Domains\Purchasing\Domain\Models\GoodsReceipt;
use App\Domains\Purchasing\Domain\Models\GoodsReceiptItem;
use App\Domains\Purchasing\Domain\Models\PurchaseOrder;
use App\Domains\Purchasing\Domain\Models\PurchaseOrderItem;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class UpdateGoodsReceipt
{
    public function execute(string $id, array $data, ?string $userId = null): GoodsReceipt
    {
        return DB::transaction(function () use ($id, $data, $userId) {
            $goodsReceipt = GoodsReceipt::findOrFail($id);

            if ($goodsReceipt->status !== 'DRAFT') {
                throw new RuntimeException('Only draft goods receipts can be edited.', 422);
            }

            $purchaseOrder = PurchaseOrder::with('items.receiptItems.goodsReceipt')
                ->findOrFail($goodsReceipt->purchase_order_id);

            $goodsReceipt->update([
                'notes' => $data['notes'] ?? null,
            ]);

            $goodsReceipt->items()->delete();

            $allowOverReceiving = $data['allow_over_receiving'] ?? false;

            // Pre-index PO items to avoid N+1 queries
            $poItemsById = $purchaseOrder->items->keyBy('id');

            foreach ($data['items'] as $itemData) {
                $poItem = $poItemsById->get($itemData['purchase_order_item_id']);

                if (!$poItem) {
                    throw new RuntimeException("Purchase order item not found: {$itemData['purchase_order_item_id']}", 422);
                }

                $alreadyReceived = $poItem->receiptItems
                    ->filter(fn ($ri) => in_array($ri->goodsReceipt?->status, ['RECEIVED', 'PARTIALLY_RETURNED', 'RETURNED'], true))
                    ->sum(fn ($ri) => $ri->quantity_received - $ri->quantity_returned);

                $remaining = (int) $poItem->quantity_ordered - (int) $alreadyReceived;
                $quantityReceived = (int) $itemData['quantity_received'];

                if (!$allowOverReceiving && $quantityReceived > $remaining) {
                    throw new RuntimeException("Received quantity cannot exceed remaining quantity ({$remaining}).", 422);
                }

                GoodsReceiptItem::create([
                    'goods_receipt_id' => $goodsReceipt->id,
                    'purchase_order_item_id' => $poItem->id,
                    'product_id' => $poItem->product_id,
                    'product_supplier_id' => $poItem->product_supplier_id,
                    'quantity_received' => $quantityReceived,
                    'quantity_rejected' => $itemData['quantity_rejected'] ?? 0,
                    'quantity_promo' => $itemData['quantity_promo'] ?? 0,
                    'notes' => $itemData['notes'] ?? null,
                ]);
            }

            return $goodsReceipt->fresh('items');
        });
    }
}
