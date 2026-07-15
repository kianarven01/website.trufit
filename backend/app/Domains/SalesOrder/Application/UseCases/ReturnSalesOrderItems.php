<?php

namespace App\Domains\SalesOrder\Application\UseCases;

use App\Domains\SalesOrder\Domain\Models\SalesOrder;
use App\Domains\Inventory\Domain\Models\Inventory;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ReturnSalesOrderItems
{
    public function execute(string $id, array $itemIds, ?string $userId = null): SalesOrder
    {
        return DB::transaction(function () use ($id, $itemIds, $userId) {
            $salesOrder = SalesOrder::lockForUpdate()->findOrFail($id);

            if (!in_array($salesOrder->Status, ['IN_PROGRESS', 'COMPLETED'], true)) {
                throw new RuntimeException('Sales order must be in progress or completed to return items.', 422);
            }

            $items = $salesOrder->items()->whereIn('id', $itemIds)->lockForUpdate()->get();

            if ($items->isEmpty()) {
                throw new RuntimeException('No valid items found to return.', 422);
            }

            $returnedCount = 0;

            foreach ($items as $item) {
                if (!$item->is_issued) {
                    continue;
                }

                $inventory = Inventory::where('productID', $item->ProductID)
                    ->lockForUpdate()
                    ->first();

                if ($inventory) {
                    $inventory->update([
                        'quantity_on_hand' => $inventory->quantity_on_hand + $item->quantity,
                    ]);
                }

                $item->update([
                    'is_issued' => false,
                    'issued_at' => null,
                    'issued_by' => null,
                ]);

                $returnedCount++;
            }

            return $salesOrder->fresh(['items.product.manufacturer', 'items.product.productSuppliers.inventory', 'items.product.inventoryRows']);
        });
    }
}
