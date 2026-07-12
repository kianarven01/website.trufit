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

            if (!in_array($purchaseOrder->status, ['WAITING_TO_RECEIVE', 'PARTIALLY_RECEIVED'], true)) {
                throw new RuntimeException('Goods receipt can only be created from an active purchase order (Waiting to Receive or Partially Received).', 422);
            }

            $hasActive = GoodsReceipt::where('purchase_order_id', $purchaseOrder->id)
                ->whereIn('status', ['DRAFT', 'SUBMITTED'])
                ->exists();

            if ($hasActive) {
                throw new RuntimeException('An active goods receipt (Draft or Submitted) already exists for this purchase order. Please approve or cancel it first.', 422);
            }

            $receipt = GoodsReceipt::create([
                'receipt_number' => $this->numberService->generate(),
                'purchase_order_id' => $purchaseOrder->id,
                'status' => 'DRAFT',
                'received_at' => now(),
                'notes' => $data['notes'] ?? null,
                'created_by' => $userId,
                'received_by' => null,
            ]);

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
