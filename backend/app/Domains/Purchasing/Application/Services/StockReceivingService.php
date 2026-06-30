<?php

namespace App\Domains\Purchasing\Application\Services;

use App\Domains\Inventory\Domain\Models\Inventory;
use App\Domains\Purchasing\Domain\Models\GoodsReceipt;
use App\Domains\Purchasing\Domain\Models\StockMovement;

class StockReceivingService
{
    private const DEFAULT_LOCATION_ID = 'd3b07384-d113-4ec6-a55d-752007414777';

    public function receiveGoods(GoodsReceipt $receipt): int
    {
        $createdMovementCount = 0;

        foreach ($receipt->items as $item) {
            if ($item->quantity_received <= 0) {
                continue;
            }

            $inventory = Inventory::firstOrCreate(
                [
                    'productID' => $item->product_id,
                    'product_supplier_id' => $item->product_supplier_id,
                    'location_id' => self::DEFAULT_LOCATION_ID,
                ],
                [
                    'quantity_on_hand' => 0,
                    'reserved_quantity' => 0,
                    'reorder_level' => 5,
                    'reorder_qty' => 10,
                    'sell_price' => null,
                ]
            );

            $inventory->increment('quantity_on_hand', $item->quantity_received);

            StockMovement::create([
                'inventory_id' => $inventory->id,
                'product_id' => $item->product_id,
                'product_supplier_id' => $item->product_supplier_id,
                'movement_type' => 'IN_RECEIPT',
                'quantity' => $item->quantity_received,
                'reference_type' => 'GOODS_RECEIPT',
                'reference_id' => $receipt->id,
                'notes' => 'Goods receipt from PO ' . $receipt->purchaseOrder?->po_number,
            ]);

            $createdMovementCount++;
        }

        return $createdMovementCount;
    }
}
