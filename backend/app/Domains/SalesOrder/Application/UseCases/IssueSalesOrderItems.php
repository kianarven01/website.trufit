<?php

namespace App\Domains\SalesOrder\Application\UseCases;

use App\Domains\SalesOrder\Domain\Models\SalesOrder;
use App\Domains\Inventory\Domain\Models\Inventory;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class IssueSalesOrderItems
{
    public function execute(string $id, array $itemIds, ?string $userId = null): SalesOrder
    {
        return DB::transaction(function () use ($id, $itemIds, $userId) {
            $salesOrder = SalesOrder::lockForUpdate()->findOrFail($id);

            if (!in_array($salesOrder->Status, ['APPROVED', 'IN_PROGRESS'], true)) {
                throw new RuntimeException('Sales order must be approved or in progress to issue items.', 422);
            }

            $items = $salesOrder->items()->whereIn('id', $itemIds)->lockForUpdate()->get();

            if ($items->isEmpty()) {
                throw new RuntimeException('No valid items found to issue.', 422);
            }

            $issuedCount = 0;

            foreach ($items as $item) {
                if ($item->is_issued) {
                    continue;
                }

                if ($item->needs_ordering) {
                    throw new RuntimeException(
                        "Cannot issue item '{$item->product->name}' — it is marked as needing to be ordered.",
                        422
                    );
                }

                $productInventories = Inventory::where('productID', $item->ProductID)
                    ->lockForUpdate()
                    ->get();

                if ($productInventories->isEmpty()) {
                    throw new RuntimeException(
                        "No inventory record found for product '{$item->product->name}'.",
                        422
                    );
                }

                $totalOnHand = $productInventories->sum('quantity_on_hand');

                if ($totalOnHand < (int) $item->quantity) {
                    throw new RuntimeException(
                        "Insufficient stock for '{$item->product->name}'. Available: {$totalOnHand}, Requested: {$item->quantity}.",
                        422
                    );
                }

                $qtyToIssue = (int) $item->quantity;

                // Prioritize rows that have both quantity_on_hand > 0 and reserved_quantity > 0
                $sortedInventories = $productInventories->sortByDesc(function ($inv) {
                    return $inv->reserved_quantity > 0 ? 1 : 0;
                });

                foreach ($sortedInventories as $inventory) {
                    if ($qtyToIssue <= 0) {
                        break;
                    }

                    if ($inventory->quantity_on_hand <= 0) {
                        continue;
                    }

                    $deductFromRow = min($qtyToIssue, $inventory->quantity_on_hand);
                    $reduceReserved = min($deductFromRow, $inventory->reserved_quantity);

                    $inventory->update([
                        'quantity_on_hand' => $inventory->quantity_on_hand - $deductFromRow,
                        'reserved_quantity' => max(0, $inventory->reserved_quantity - $reduceReserved),
                    ]);

                    $qtyToIssue -= $deductFromRow;
                }

                $item->update([
                    'is_issued' => true,
                    'issued_at' => now(),
                    'issued_by' => $userId,
                ]);

                $issuedCount++;
            }

            if ($salesOrder->Status === 'APPROVED' && $issuedCount > 0 && $salesOrder->type !== 'COUNTER') {
                $salesOrder->update(['Status' => 'IN_PROGRESS']);
            }

            return $salesOrder->fresh(['items.product.manufacturer', 'items.product.productSuppliers.inventory', 'items.product.inventoryRows']);
        });
    }
}
