<?php

namespace App\Domains\Purchasing\Application\Services;

use App\Domains\Inventory\Domain\Models\Inventory;
use App\Domains\Inventory\Domain\Models\StockLocation;
use App\Domains\Purchasing\Domain\Models\GoodsReceipt;
use App\Domains\Purchasing\Domain\Models\StockMovement;
use RuntimeException;

class StockReceivingService
{
    private function getDefaultLocationId(): ?string
    {
        $location = StockLocation::where('is_active', true)->orderBy('name')->first();
        return $location?->id;
    }

    public function receiveGoods(GoodsReceipt $receipt): int
    {
        $createdMovementCount = 0;
        $defaultLocationId = $this->getDefaultLocationId();

        if (!$defaultLocationId) {
            throw new RuntimeException('No active warehouse found. Please create a warehouse first.', 422);
        }

        $receipt->loadMissing(['items', 'purchaseOrder']);

        foreach ($receipt->items as $item) {
            $quantityReceived = (int) $item->quantity_received;
            $quantityPromo = (int) ($item->quantity_promo ?? 0);
            $totalReceived = $quantityReceived + $quantityPromo;

            if ($totalReceived <= 0) {
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
                ->where('location_id', $defaultLocationId)
                ->lockForUpdate()
                ->first();

            if (!$inventory) {
                $inventory = Inventory::create([
                    'productID' => $item->product_id,
                    'product_supplier_id' => $item->product_supplier_id,
                    'location_id' => $defaultLocationId,
                    'quantity_on_hand' => 0,
                    'reserved_quantity' => 0,
                    'reorder_level' => 5,
                    'reorder_qty' => 10,
                    'sell_price' => null,
                ]);
            }

            $inventory->quantity_on_hand =
                (int) $inventory->quantity_on_hand + $totalReceived;

            $inventory->save();

            $promoNote = $quantityPromo > 0 ? " (+{$quantityPromo} free promo)" : "";

            StockMovement::create([
                'inventory_id' => $inventory->id,
                'product_id' => $item->product_id,
                'product_supplier_id' => $item->product_supplier_id,
                'movement_type' => 'IN_RECEIPT',
                'quantity' => $totalReceived,
                'reference_type' => 'GOODS_RECEIPT',
                'reference_id' => $receipt->id,
                'notes' => "Received {$quantityReceived} units{$promoNote} from PO " . ($receipt->purchaseOrder?->po_number ?? '-'),
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