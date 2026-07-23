<?php

namespace App\Domains\Inventory\Observers;

use App\Domains\Inventory\Domain\Models\Inventory;
use App\Domains\SalesOrder\Domain\Models\SalesOrderItem;

class InventoryObserver
{
    /**
     * Handle the Inventory "updated" event.
     * When quantity_on_hand increases, clear needs_ordering on matching SO items.
     */
    public function updated(Inventory $inventory): void
    {
        // Only act when quantity_on_hand increases
        $oldQuantity = $inventory->getOriginal('quantity_on_hand') ?? 0;
        $newQuantity = $inventory->quantity_on_hand ?? 0;

        if ($newQuantity <= $oldQuantity) {
            return;
        }

        // Find SO items with needs_ordering that match this product
        // and whose quantity is now satisfied by stock
        $productID = $inventory->productID;
        $itemsToClear = SalesOrderItem::where('ProductID', $productID)
            ->where('needs_ordering', true)
            ->where('is_issued', false)
            ->get();

        foreach ($itemsToClear as $item) {
            // Only clear if stock is now sufficient
            if ($newQuantity >= $item->quantity) {
                $item->update(['needs_ordering' => false]);
            }
        }
    }
}
