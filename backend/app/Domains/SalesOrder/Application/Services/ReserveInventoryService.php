<?php

namespace App\Domains\SalesOrder\Application\Services;

use App\Domains\SalesOrder\Domain\Models\SalesOrder;
use App\Domains\Inventory\Domain\Models\Inventory;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ReserveInventoryService
{
    /**
     * Reserve inventory items for a given Sales Order.
     *
     * @throws RuntimeException
     */
    public function reserve(SalesOrder $salesOrder): void
    {
        DB::transaction(function () use ($salesOrder) {
            $reservableItems = $salesOrder->items->reject(fn ($item) => $item->needs_ordering);

            if ($reservableItems->isEmpty()) {
                return;
            }

            $productIds = $reservableItems->pluck('ProductID')->unique()->toArray();

            $inventoryMap = Inventory::whereIn('productID', $productIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('productID');

            foreach ($reservableItems as $item) {
                $qty = (int) $item->quantity;
                $productId = $item->ProductID;

                $inventory = $inventoryMap->get($productId);

                if (!$inventory) {
                    $inventory = new Inventory();
                    $inventory->productID = $productId;
                    $inventory->quantity_on_hand = 0;
                    $inventory->reserved_quantity = 0;
                    $defaultLocation = DB::table('Main.StockLocations')->first();
                    if ($defaultLocation) {
                        $inventory->location_id = $defaultLocation->id;
                    }
                    $inventory->save();
                    $inventoryMap->put($productId, $inventory);
                }

                $available = $inventory->quantity_on_hand - $inventory->reserved_quantity;

                if ($qty > $available) {
                    throw new RuntimeException(
                        "Insufficient stock for product {$productId}. Available: {$available}, requested: {$qty}.",
                        422
                    );
                }

                $inventory->reserved_quantity += $qty;
                $inventory->save();
            }
        });
    }

    /**
     * Unreserve inventory items (e.g. if Sales Order is voided or cancelled).
     */
    public function unreserve(SalesOrder $salesOrder): void
    {
        DB::transaction(function () use ($salesOrder) {
            $reservableItems = $salesOrder->items->reject(fn ($item) => $item->needs_ordering);

            if ($reservableItems->isEmpty()) {
                return;
            }

            $productIds = $reservableItems->pluck('ProductID')->unique()->toArray();

            $inventoryMap = Inventory::whereIn('productID', $productIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('productID');

            foreach ($reservableItems as $item) {
                $inventory = $inventoryMap->get($item->ProductID);

                if ($inventory) {
                    $inventory->reserved_quantity = max(0, $inventory->reserved_quantity - (int) $item->quantity);
                    $inventory->save();
                }
            }
        });
    }
}
