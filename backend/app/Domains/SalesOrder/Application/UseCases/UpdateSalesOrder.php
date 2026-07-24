<?php

namespace App\Domains\SalesOrder\Application\UseCases;

use App\Domains\SalesOrder\Domain\Models\SalesOrder;
use App\Domains\SalesOrder\Domain\Models\SalesOrderItem;
use App\Domains\SalesOrder\Application\Services\ReserveInventoryService;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class UpdateSalesOrder
{
    public function __construct(
        private readonly ReserveInventoryService $reserveInventoryService
    ) {}

    public function execute(string $id, array $data): SalesOrder
    {
        return DB::transaction(function () use ($id, $data) {
            $salesOrder = SalesOrder::lockForUpdate()->findOrFail($id);

            if ($salesOrder->Status !== 'DRAFT') {
                throw new RuntimeException('Only draft sales orders can be edited.', 422);
            }

            $salesOrder->update([
                'customerID' => array_key_exists('customer_id', $data) ? $data['customer_id'] : $salesOrder->customerID,
                'vehicle_id' => array_key_exists('vehicle_id', $data) ? $data['vehicle_id'] : $salesOrder->vehicle_id,
                'mileage' => array_key_exists('mileage', $data) ? $data['mileage'] : $salesOrder->mileage,
                'remarks' => array_key_exists('notes', $data) ? $data['notes'] : $salesOrder->remarks,
            ]);

            if (isset($data['items']) && is_array($data['items'])) {
                $existingItems = $salesOrder->items()->get();

                // Build lookup maps by ProductID and by custom_name
                $existingByProductId = $existingItems->whereNotNull('ProductID')->keyBy('ProductID');
                $existingByCustomName = $existingItems->whereNotNull('custom_name')->keyBy('custom_name');

                $submittedProductIds = [];
                $submittedCustomNames = [];
                foreach ($data['items'] as $item) {
                    if (!empty($item['product_id'])) {
                        $submittedProductIds[] = $item['product_id'];
                    }
                    if (!empty($item['custom_name'])) {
                        $submittedCustomNames[] = $item['custom_name'];
                    }
                }

                // Remove items no longer in the submission
                foreach ($existingByProductId as $productId => $existingItem) {
                    if (!in_array($productId, $submittedProductIds)) {
                        $existingItem->delete();
                    }
                }
                foreach ($existingByCustomName as $customName => $existingItem) {
                    if (!in_array($customName, $submittedCustomNames)) {
                        $existingItem->delete();
                    }
                }

                $totalAmount = 0;

                foreach ($data['items'] as $item) {
                    $quantity = (int) ($item['quantity'] ?? 1);
                    $unitPrice = (float) ($item['unit_price'] ?? 0);
                    $subtotal = round($quantity * $unitPrice, 2);

                    // Find existing item by product_id or custom_name
                    $existingItem = null;
                    if (!empty($item['product_id']) && isset($existingByProductId[$item['product_id']])) {
                        $existingItem = $existingByProductId[$item['product_id']];
                    } elseif (!empty($item['custom_name']) && isset($existingByCustomName[$item['custom_name']])) {
                        $existingItem = $existingByCustomName[$item['custom_name']];
                    }

                    if ($existingItem) {
                        $existingItem->update([
                            'quantity' => $quantity,
                            'UnitPrice' => $unitPrice,
                            'SubTotal' => $subtotal,
                            'needs_ordering' => $item['needs_ordering'] ?? $existingItem->needs_ordering,
                            'TaxAtSale' => $item['tax_at_sale'] ?? $existingItem->TaxAtSale,
                        ]);
                    } else {
                        $taxAtSale = $item['tax_at_sale'] ?? null;
                        if (!$taxAtSale && !empty($item['product_id'])) {
                            $ps = \App\Domains\Supplier\Domain\Models\ProductSupplier::where('product_id', $item['product_id'])->first();
                            $taxAtSale = $ps && $ps->is_vat ? 'VAT' : 'NON_VAT';
                        }
                        $taxAtSale = $taxAtSale ?? 'NON_VAT';

                        SalesOrderItem::create([
                            'id' => \Illuminate\Support\Str::uuid(),
                            'SalesOrderID' => $salesOrder->id,
                            'ProductID' => $item['product_id'] ?? null,
                            'custom_name' => $item['custom_name'] ?? null,
                            'quantity' => $quantity,
                            'UnitPrice' => $unitPrice,
                            'SubTotal' => $subtotal,
                            'CostAtSale' => $item['cost_at_sale'] ?? 0.00,
                            'TaxAtSale' => $taxAtSale,
                            'needs_ordering' => $item['needs_ordering'] ?? false,
                        ]);
                    }

                    $totalAmount += $subtotal;
                }

                $salesOrder->update([
                    'Total' => $totalAmount,
                    'Balance' => $totalAmount,
                ]);
            }

            return $salesOrder->fresh();
        });
    }
}
