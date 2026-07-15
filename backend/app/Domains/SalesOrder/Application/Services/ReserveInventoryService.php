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
        $reservableItems = $salesOrder->items->reject(fn ($item) => $item->needs_ordering);

        if ($reservableItems->isEmpty()) {
            return;
        }

        $productIds = $reservableItems->pluck('ProductID')->unique()->toArray();

        $inventories = Inventory::whereIn('productID', $productIds)
            ->lockForUpdate()
            ->get()
            ->groupBy('productID');

        foreach ($reservableItems as $item) {
            $qtyNeeded = (int) $item->quantity;
            $productId = $item->ProductID;

            $productInventories = $inventories->get($productId) ?? collect();

            // Calculate total available stock across all warehouses/locations
            $totalAvailable = $productInventories->sum(fn ($inv) => max(0, $inv->quantity_on_hand - $inv->reserved_quantity));

            if ($qtyNeeded > $totalAvailable) {
                $productName = $item->product ? $item->product->name : $productId;
                throw new RuntimeException(
                    "Insufficient stock for '{$productName}'. Available: {$totalAvailable}, Requested: {$qtyNeeded}.",
                    422
                );
            }

            // Distribute reservation among rows that have available stock
            foreach ($productInventories as $inventory) {
                if ($qtyNeeded <= 0) {
                    break;
                }

                $availableInRow = $inventory->quantity_on_hand - $inventory->reserved_quantity;
                if ($availableInRow <= 0) {
                    continue;
                }

                $reserveFromRow = min($qtyNeeded, $availableInRow);
                $inventory->reserved_quantity += $reserveFromRow;
                $inventory->save();
                $qtyNeeded -= $reserveFromRow;
            }

            // If we still need quantity (e.g. no inventory rows existed at all), create a default row
            if ($qtyNeeded > 0) {
                $inventory = new Inventory();
                $inventory->productID = $productId;
                $inventory->quantity_on_hand = 0;
                $inventory->reserved_quantity = $qtyNeeded;
                $defaultLocation = DB::table('Main.StockLocations')->first();
                if ($defaultLocation) {
                    $inventory->location_id = $defaultLocation->id;
                }
                $inventory->save();
            }
        }
    }

    /**
     * Unreserve inventory items (e.g. if Sales Order is voided or cancelled).
     */
    public function unreserve(SalesOrder $salesOrder): void
    {
        $reservableItems = $salesOrder->items->reject(fn ($item) => $item->needs_ordering);

        if ($reservableItems->isEmpty()) {
            return;
        }

        foreach ($reservableItems as $item) {
            $qtyToUnreserve = (int) $item->quantity;
            $productInventories = Inventory::where('productID', $item->ProductID)
                ->where('reserved_quantity', '>', 0)
                ->lockForUpdate()
                ->get();

            foreach ($productInventories as $inventory) {
                if ($qtyToUnreserve <= 0) {
                    break;
                }
                $unreserveFromRow = min($qtyToUnreserve, $inventory->reserved_quantity);
                $inventory->reserved_quantity -= $unreserveFromRow;
                $inventory->save();
                $qtyToUnreserve -= $unreserveFromRow;
            }
        }
    }
}
