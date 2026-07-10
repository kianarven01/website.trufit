<?php

namespace App\Domains\Purchasing\Application\UseCases;

use App\Domains\Purchasing\Application\Services\PurchaseOrderStatusService;
use App\Domains\Inventory\Domain\Models\Inventory;
use App\Domains\Inventory\Domain\Models\StockLocation;
use App\Domains\Purchasing\Domain\Models\GoodsReceipt;
use App\Domains\Purchasing\Domain\Models\GoodsReceiptItem;
use App\Domains\Purchasing\Domain\Models\StockMovement;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ReturnGoodsReceiptItems
{
    private function getDefaultLocationId(): ?string
    {
        $location = StockLocation::where('is_active', true)->orderBy('name')->first();
        return $location?->id;
    }

    public function execute(string $goodsReceiptId, array $itemsData): GoodsReceipt
    {
        return DB::transaction(function () use ($goodsReceiptId, $itemsData) {
            $receipt = GoodsReceipt::with(['items', 'purchaseOrder'])
                ->lockForUpdate()
                ->findOrFail($goodsReceiptId);

            if (!in_array($receipt->status, ['APPROVED', 'PARTIALLY_RETURNED'])) {
                throw new RuntimeException('Only approved or partially returned goods receipts can have items returned.', 422);
            }

            $defaultLocationId = $this->getDefaultLocationId();
            if (!$defaultLocationId) {
                throw new RuntimeException('No active warehouse location found.', 422);
            }

            $returnedCount = 0;

            foreach ($itemsData as $itemInput) {
                $goodsReceiptItemId = $itemInput['goods_receipt_item_id'];
                $quantityToReturn = (int) $itemInput['quantity_returned'];
                $notes = $itemInput['notes'] ?? null;

                if ($quantityToReturn <= 0) {
                    continue;
                }

                $item = GoodsReceiptItem::where('goods_receipt_id', $receipt->id)
                    ->findOrFail($goodsReceiptItemId);

                $remaining = $item->quantity_received + ($item->quantity_promo ?? 0) - $item->quantity_returned;

                if ($quantityToReturn > $remaining) {
                    throw new RuntimeException("Cannot return {$quantityToReturn} items. Only {$remaining} remaining for item.", 422);
                }

                $inventory = Inventory::query()
                    ->where('productID', $item->product_id)
                    ->where('product_supplier_id', $item->product_supplier_id)
                    ->where('location_id', $defaultLocationId)
                    ->lockForUpdate()
                    ->first();

                if (!$inventory || (int)$inventory->quantity_on_hand < $quantityToReturn) {
                    $onHand = $inventory ? $inventory->quantity_on_hand : 0;
                    throw new RuntimeException("Cannot return item. Insufficient stock on hand (requested: {$quantityToReturn}, available: {$onHand}).", 422);
                }

                // Decrement inventory
                $inventory->quantity_on_hand = (int) $inventory->quantity_on_hand - $quantityToReturn;
                $inventory->save();

                // Increment returned quantity on GoodsReceiptItem
                $item->quantity_returned = $item->quantity_returned + $quantityToReturn;
                $item->save();

                // Record stock movement as RETURN
                StockMovement::create([
                    'inventory_id' => $inventory->id,
                    'product_id' => $item->product_id,
                    'product_supplier_id' => $item->product_supplier_id,
                    'movement_type' => 'RETURN',
                    'quantity' => $quantityToReturn,
                    'reference_type' => 'GOODS_RECEIPT',
                    'reference_id' => $receipt->id,
                    'notes' => 'Return items: ' . ($notes ? $notes : 'Defective / Excess goods'),
                ]);

                $returnedCount++;
            }

            if ($returnedCount === 0) {
                throw new RuntimeException('No items were selected for return.', 422);
            }

            // Recalculate status of GoodsReceipt
            $receipt->load('items');
            $totalReceived = $receipt->items->sum('quantity_received');
            $totalPromo = $receipt->items->sum('quantity_promo');
            $totalUnits = $totalReceived + $totalPromo;
            $totalReturned = $receipt->items->sum('quantity_returned');

            if ($totalReturned >= $totalUnits) {
                $newStatus = 'RETURNED';
            } elseif ($totalReturned > 0) {
                $newStatus = 'PARTIALLY_RETURNED';
            } else {
                $newStatus = 'APPROVED';
            }

            $receipt->update(['status' => $newStatus]);

            if ($receipt->purchaseOrder) {
                app(PurchaseOrderStatusService::class)->updateReceiptStatus($receipt->purchaseOrder);
            }

            return $receipt->fresh(['purchaseOrder.supplier', 'items.product', 'items.purchaseOrderItem']);
        });
    }
}
