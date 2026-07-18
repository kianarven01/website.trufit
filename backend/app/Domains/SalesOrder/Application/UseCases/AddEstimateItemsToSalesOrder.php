<?php

namespace App\Domains\SalesOrder\Application\UseCases;

use App\Domains\SalesOrder\Domain\Models\SalesOrder;
use App\Domains\SalesOrder\Domain\Models\SalesOrderItem;
use App\Domains\Estimate\Domain\Models\EstimateItem;
use App\Domains\SalesOrder\Application\Services\ReserveInventoryService;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class AddEstimateItemsToSalesOrder
{
    public function __construct(
        private readonly ReserveInventoryService $reserveInventoryService
    ) {}

    public function execute(SalesOrder $salesOrder, array $estimateItemIds, ?string $userId = null): SalesOrder
    {
        return DB::transaction(function () use ($salesOrder, $estimateItemIds, $userId) {
            $estimate = $salesOrder->estimate;

            if (!$estimate) {
                throw new InvalidArgumentException('This Sales Order has no linked estimate.');
            }

            if (!in_array($salesOrder->Status, ['APPROVED', 'IN_PROGRESS'])) {
                throw new InvalidArgumentException('Only APPROVED or IN_PROGRESS Sales Orders can have items added.');
            }

            $estimateItems = EstimateItem::whereIn('id', $estimateItemIds)
                ->where('estimate_id', $estimate->id)
                ->get();

            if ($estimateItems->isEmpty()) {
                throw new InvalidArgumentException('No valid estimate items found.');
            }

            $existingProductIds = $salesOrder->items->pluck('ProductID')->toArray();

            $added = 0;
            $newItems = [];
            foreach ($estimateItems as $estItem) {
                if ($estItem->item_type !== 'part' || !$estItem->product_id) {
                    continue;
                }

                if (in_array($estItem->product_id, $existingProductIds)) {
                    continue;
                }

                $quantity = (int) $estItem->quantity;
                $unitPrice = round((float) $estItem->unit_price, 2);
                $subTotal = round($quantity * $unitPrice, 2);

                $ps = \App\Domains\Supplier\Domain\Models\ProductSupplier::where('product_id', $estItem->product_id)->first();
                $taxAtSale = $ps && $ps->is_vat ? 'VAT' : 'NON_VAT';

                $newItem = SalesOrderItem::create([
                    'SalesOrderID' => $salesOrder->id,
                    'ProductID' => $estItem->product_id,
                    'quantity' => $quantity,
                    'UnitPrice' => $unitPrice,
                    'SubTotal' => $subTotal,
                    'TaxAtSale' => $taxAtSale,
                    'needs_ordering' => $estItem->needs_ordering ?? false,
                ]);

                $newItems[] = $newItem;
                $existingProductIds[] = $estItem->product_id;
                $added++;
            }

            if ($added === 0) {
                throw new InvalidArgumentException('All selected items are already on this Sales Order.');
            }

            // Auto-reserve the newly added items
            $this->reserveInventoryService->reserveItems($newItems);

            // Recalculate SO Total and Balance from all items
            $totalAmount = $salesOrder->items()->sum('SubTotal');
            $salesOrder->update([
                'Total' => $totalAmount,
                'Balance' => $totalAmount,
            ]);

            $salesOrder->touch();

            return $salesOrder->fresh([
                'customer',
                'vehicle',
                'estimate',
                'items.product.manufacturer',
                'items.product.productSuppliers.inventory',
                'items.product.inventoryRows',
                'creator',
                'approvedByUser',
                'submittedByUser.employee',
                'cancelledByUser.employee',
                'startedByUser.employee',
            ]);
        });
    }
}
