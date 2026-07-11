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

            $purchaseOrder = PurchaseOrder::findOrFail($goodsReceipt->purchase_order_id);

            $goodsReceipt->update([
                'notes' => $data['notes'] ?? null,
            ]);

            // Delete old items to rebuild them
            $goodsReceipt->items()->delete();

            $allowOverReceiving = $data['allow_over_receiving'] ?? false;

            foreach ($data['items'] as $itemData) {
                $poItem = PurchaseOrderItem::with('receiptItems')
                    ->where('purchase_order_id', $purchaseOrder->id)
                    ->findOrFail($itemData['purchase_order_item_id']);

                $alreadyReceived = $poItem->receiptItems()
                    ->whereHas('goodsReceipt', function ($query) {
                        $query->whereIn('status', ['RECEIVED', 'PARTIALLY_RETURNED', 'RETURNED']);
                    })
                    ->selectRaw('SUM(quantity_received - quantity_returned) as total')
                    ->value('total') ?? 0;

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
