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

    public function execute(string $salesOrderId, string $itemId, string $productId): SalesOrderItem
    {
        return DB::transaction(function () use ($salesOrderId, $itemId, $productId) {
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

            // Link the item to the product
            $item->update([
                'ProductID' => $productId,
                'TaxAtSale' => $taxAtSale,
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
