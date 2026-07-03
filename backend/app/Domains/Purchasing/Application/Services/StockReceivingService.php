<?php

namespace App\Domains\Purchasing\Application\Services;

use App\Domains\Inventory\Domain\Models\Inventory;
use App\Domains\Purchasing\Domain\Models\GoodsReceipt;
use App\Domains\Purchasing\Domain\Models\StockMovement;
use RuntimeException;

class StockReceivingService
{
    private const DEFAULT_LOCATION_ID = 'd3b07384-d113-4ec6-a55d-752007414777';

    public function receiveGoods(GoodsReceipt $receipt): int
    {
        $createdMovementCount = 0;

        $receipt->loadMissing(['items', 'purchaseOrder']);

        foreach ($receipt->items as $item) {
            $quantityReceived = (int) $item->quantity_received;

            if ($quantityReceived <= 0) {
                continue;
            }

            if (!$item->product_id) {
                throw new RuntimeException('Goods receipt item is missing product.', 422);
            }

            if (!$item->product_supplier_id) {
                throw new RuntimeException('Goods receipt item is missing product supplier.', 422);
            }

            $inventory = Inventory::query()
                ->where('productID', $item->product_id)
                ->where('product_supplier_id', $item->product_supplier_id)
                ->where('location_id', self::DEFAULT_LOCATION_ID)
                ->lockForUpdate()
                ->first();

            if (!$inventory) {
                $inventory = Inventory::create([
                    'productID' => $item->product_id,
                    'product_supplier_id' => $item->product_supplier_id,
                    'location_id' => self::DEFAULT_LOCATION_ID,
                    'quantity_on_hand' => 0,
                    'reserved_quantity' => 0,
                    'reorder_level' => 5,
                    'reorder_qty' => 10,
                    'sell_price' => null,
                ]);
            }

            $inventory->quantity_on_hand =
                (int) $inventory->quantity_on_hand + $quantityReceived;

            $inventory->save();

            StockMovement::create([
                'inventory_id' => $inventory->id,
                'product_id' => $item->product_id,
                'product_supplier_id' => $item->product_supplier_id,
                'movement_type' => 'IN_RECEIPT',
                'quantity' => $quantityReceived,
                'reference_type' => 'GOODS_RECEIPT',
                'reference_id' => $receipt->id,
                'notes' => 'Goods receipt from PO ' . ($receipt->purchaseOrder?->po_number ?? '-'),
            ]);

            $createdMovementCount++;
        }

        if ($createdMovementCount === 0) {
            throw new RuntimeException(
                'Goods receipt has no received quantity to approve.',
                422
            );
        }

        return $createdMovementCount;
    }
}