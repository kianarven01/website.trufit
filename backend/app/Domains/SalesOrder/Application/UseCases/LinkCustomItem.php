<?php

namespace App\Domains\SalesOrder\Application\UseCases;

use App\Domains\SalesOrder\Domain\Models\SalesOrder;
use App\Domains\SalesOrder\Domain\Models\SalesOrderItem;
use App\Domains\SalesOrder\Application\Services\ReserveInventoryService;
use App\Domains\Product\Domain\Models\Product;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class LinkCustomItem
{
    public function __construct(
        private readonly ReserveInventoryService $reserveInventoryService
    ) {}

    /**
     * @param bool|null $useCustomPrice  null = auto (0→inventory, >0→keep), true = keep custom, false = use inventory
     */
    public function execute(string $salesOrderId, string $itemId, string $productId, ?bool $useCustomPrice = null): SalesOrderItem
    {
        return DB::transaction(function () use ($salesOrderId, $itemId, $productId, $useCustomPrice) {
            $salesOrder = SalesOrder::lockForUpdate()->findOrFail($salesOrderId);

            if (!in_array($salesOrder->Status, ['APPROVED', 'IN_PROGRESS'])) {
                throw new RuntimeException('Only APPROVED or IN_PROGRESS Sales Orders can have items linked.', 422);
            }

            $item = SalesOrderItem::where('id', $itemId)
                ->where('SalesOrderID', $salesOrderId)
                ->firstOrFail();

            if (empty($item->custom_name)) {
                throw new RuntimeException('This item has no custom name to link.', 422);
            }

            $product = Product::find($productId);
            if (!$product) {
                throw new RuntimeException('Product not found.', 422);
            }

            // Resolve tax code
            $ps = \App\Domains\Supplier\Domain\Models\ProductSupplier::where('product_id', $productId)->first();
            $taxAtSale = $ps && $ps->is_vat ? 'VAT' : 'NON_VAT';

            // Get inventory price
            $inventory = \App\Domains\Inventory\Domain\Models\Inventory::where('productID', $productId)->first();
            $inventoryPrice = (float) ($inventory?->sell_price ?? 0);

            // Determine price
            $currentPrice = (float) $item->UnitPrice;
            if ($useCustomPrice === true) {
                // Keep custom price as-is
                $unitPrice = $currentPrice;
            } elseif ($useCustomPrice === false) {
                // Use inventory price
                $unitPrice = $inventoryPrice;
            } else {
                // Auto: if item has no price (0), pull from inventory; otherwise keep custom
                $unitPrice = $currentPrice > 0 ? $currentPrice : $inventoryPrice;
            }

            $quantity = (int) $item->quantity;
            $subTotal = round($quantity * $unitPrice, 2);

            // Recalculate needs_ordering based on product stock
            $totalStock = $product->inventoryRows->sum('quantity_on_hand') ?? 0;
            $totalReserved = $product->inventoryRows->sum('reserved_quantity') ?? 0;
            $availableStock = $totalStock - $totalReserved;
            $needsOrdering = $availableStock < $quantity;

            // Update the item
            $item->update([
                'ProductID' => $productId,
                'TaxAtSale' => $taxAtSale,
                'UnitPrice' => $unitPrice,
                'SubTotal' => $subTotal,
                'needs_ordering' => $needsOrdering,
            ]);

            // Auto-reserve the newly linked item
            $this->reserveInventoryService->reserveItems([$item]);

            // Recalculate SO Total
            $totalAmount = $salesOrder->items()->sum('SubTotal');
            $salesOrder->update([
                'Total' => $totalAmount,
                'Balance' => $totalAmount,
            ]);

            return $item->fresh(['product.category', 'product.productSuppliers.inventory']);
        });
    }
}
