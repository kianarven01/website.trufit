<?php

namespace App\Domains\SalesOrder\Application\UseCases;

use App\Domains\SalesOrder\Domain\Models\SalesOrder;
use App\Domains\Inventory\Domain\Models\Inventory;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ReturnSalesOrderItems
{
    public function execute(string $id, array $returns, ?string $userId = null): SalesOrder
    {
        return DB::transaction(function () use ($id, $returns, $userId) {
            $salesOrder = SalesOrder::lockForUpdate()->findOrFail($id);

            if (!in_array($salesOrder->Status, ['APPROVED', 'IN_PROGRESS', 'COMPLETED'], true)) {
                throw new RuntimeException('Sales order must be approved, in progress, or completed to return items.', 422);
            }

            // Index returns by item ID
            $returnQtys = collect($returns)->keyBy('id')->map(fn($r) => (int) $r['quantity']);
            $itemIds = $returnQtys->keys()->all();

            $items = $salesOrder->items()->whereIn('id', $itemIds)->lockForUpdate()->get();

            if ($items->isEmpty()) {
                throw new RuntimeException('No valid items found to return.', 422);
            }

            foreach ($items as $item) {
                if (!$item->is_issued) {
                    continue;
                }

                $qtyToReturn = $returnQtys->get($item->id, 0);
                if ($qtyToReturn <= 0) {
                    continue;
                }

                $maxReturnable = (int) $item->quantity - (int) $item->quantity_returned;
                if ($qtyToReturn > $maxReturnable) {
                    throw new RuntimeException(
                        "Cannot return {$qtyToReturn} units for '{$item->product->name}'. Only {$maxReturnable} units are returnable.",
                        422
                    );
                }

                // Restore stock back to inventory
                $inventory = Inventory::where('productID', $item->ProductID)
                    ->lockForUpdate()
                    ->first();

                if (!$inventory) {
                    $inventory = new Inventory();
                    $inventory->productID = $item->ProductID;
                    $inventory->quantity_on_hand = 0;
                    $inventory->reserved_quantity = 0;
                    $defaultLocation = DB::table('Main.StockLocations')->first();
                    if ($defaultLocation) {
                        $inventory->location_id = $defaultLocation->id;
                    }
                    $inventory->save();
                }

                $inventory->update([
                    'quantity_on_hand' => $inventory->quantity_on_hand + $qtyToReturn,
                    'reserved_quantity' => max(0, $inventory->reserved_quantity - $qtyToReturn),
                ]);

                // Update item's quantity_returned and is_issued state
                $newQtyReturned = (int) $item->quantity_returned + $qtyToReturn;
                $item->update([
                    'quantity_returned' => $newQtyReturned,
                    'is_issued' => $newQtyReturned < (int) $item->quantity,
                    'issued_at' => $newQtyReturned < (int) $item->quantity ? $item->issued_at : null,
                    'issued_by' => $newQtyReturned < (int) $item->quantity ? $item->issued_by : null,
                ]);

                // Log StockMovement
                \App\Domains\Purchasing\Domain\Models\StockMovement::create([
                    'inventory_id' => $inventory->id,
                    'product_id' => $item->ProductID,
                    'product_supplier_id' => $inventory->product_supplier_id,
                    'movement_type' => 'RETURN',
                    'quantity' => $qtyToReturn,
                    'reference_type' => 'SALES_ORDER',
                    'reference_id' => $salesOrder->id,
                    'notes' => "Returned {$qtyToReturn} units for Sales Order " . ($salesOrder->so_number ?? $salesOrder->id),
                    'created_by' => $userId,
                ]);
            }

            // Recalculate SO total from effective quantities (quantity - quantity_returned)
            $effectiveTotal = $salesOrder->items->sum(function ($item) {
                $effectiveQty = max(0, (int) $item->quantity - (int) $item->quantity_returned);
                return round($effectiveQty * (float) $item->UnitPrice, 2);
            });
            $salesOrder->update([
                'Total' => $effectiveTotal,
                'Balance' => $effectiveTotal,
            ]);

            // Update linked billing statement if it exists
            $bill = \App\Domains\Billing\Domain\Models\BillingStatement::where('SOID', $salesOrder->id)
                ->where('status', '!=', 'Cancelled')
                ->first();

            if ($bill) {
                // Update billing items — reduce quantities for returned items
                foreach ($items as $item) {
                    $qtyToReturn = $returnQtys->get($item->id, 0);
                    if ($qtyToReturn <= 0) continue;

                    $itemName = $item->custom_name ?? $item->product?->name ?? '';
                    $billItem = \App\Domains\Billing\Domain\Models\BillingStatementItem::where('BillingStatementID', $bill->id)
                        ->where('name', $itemName)
                        ->first();

                    if ($billItem) {
                        $newQty = max(0, (int) $billItem->quantity - $qtyToReturn);
                        $billItem->update([
                            'quantity' => $newQty,
                            'SubTotal' => round($newQty * (float) $billItem->UnitPrice, 2),
                        ]);
                    }
                }

                // Recalculate billing total from items
                $billTotal = \App\Domains\Billing\Domain\Models\BillingStatementItem::where('BillingStatementID', $bill->id)
                    ->sum('SubTotal');
                $bill->update(['Total' => $billTotal]);
            }

            return $salesOrder->fresh(['items.product.manufacturer', 'items.product.productSuppliers.inventory', 'items.product.inventoryRows']);
        });
    }
}
