<?php

namespace App\Domains\SalesOrder\Application\UseCases;

use App\Domains\SalesOrder\Domain\Models\SalesOrder;
use App\Domains\SalesOrder\Domain\Models\SalesOrderItem;
use App\Domains\SalesOrder\Application\Services\ReserveInventoryService;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class UnlinkCustomItem
{
    public function __construct(
        private readonly ReserveInventoryService $reserveInventoryService
    ) {}

    public function execute(string $salesOrderId, string $itemId): SalesOrderItem
    {
        return DB::transaction(function () use ($salesOrderId, $itemId) {
            $salesOrder = SalesOrder::lockForUpdate()->findOrFail($salesOrderId);

            if (!in_array($salesOrder->Status, ['APPROVED', 'IN_PROGRESS'])) {
                throw new RuntimeException('Only APPROVED or IN_PROGRESS Sales Orders can have items unlinked.', 422);
            }

            $item = SalesOrderItem::where('id', $itemId)
                ->where('SalesOrderID', $salesOrderId)
                ->firstOrFail();

            if (empty($item->custom_name)) {
                throw new RuntimeException('This item has no custom name — cannot unlink catalog items.', 422);
            }

            if (empty($item->ProductID)) {
                throw new RuntimeException('This item is not linked to any product.', 422);
            }

            if ($item->is_issued) {
                throw new RuntimeException('Cannot unlink an item that has already been issued. Return it first.', 422);
            }

            // Release reservation for this item
            $this->reserveInventoryService->unreserveItem($item);

            // Unlink — clear product, restore original custom price
            $originalPrice = (float) ($item->original_custom_price ?? 0);
            $quantity = (int) $item->quantity;

            $item->update([
                'ProductID' => null,
                'TaxAtSale' => null,
                'UnitPrice' => $originalPrice,
                'SubTotal' => round($quantity * $originalPrice, 2),
                'needs_ordering' => true,
                'quantity_returned' => 0,
                'original_custom_price' => null,
            ]);

            // Recalculate SO Total
            $totalAmount = $salesOrder->items()->sum('SubTotal');
            $salesOrder->update([
                'Total' => $totalAmount,
                'Balance' => $totalAmount,
            ]);

            return $item->fresh();
        });
    }
}
