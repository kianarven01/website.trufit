<?php

namespace App\Domains\SalesOrder\Application\UseCases;

use App\Domains\SalesOrder\Domain\Models\SalesOrder;
use App\Domains\SalesOrder\Domain\Models\SalesOrderItem;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class UpdateSalesOrder
{
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
                $salesOrder->items()->delete();

                $totalAmount = 0;

                foreach ($data['items'] as $item) {
                    if (empty($item['product_id'])) {
                        continue;
                    }

                    $quantity = (int) ($item['quantity'] ?? 1);
                    $unitPrice = (float) ($item['unit_price'] ?? 0);
                    $subtotal = $quantity * $unitPrice;

                    SalesOrderItem::create([
                        'id' => \Illuminate\Support\Str::uuid(),
                        'SalesOrderID' => $salesOrder->id,
                        'ProductID' => $item['product_id'],
                        'quantity' => $quantity,
                        'UnitPrice' => $unitPrice,
                        'SubTotal' => $subtotal,
                        'CostAtSale' => $item['cost_at_sale'] ?? 0.00,
                        'TaxAtSale' => $item['tax_at_sale'] ?? null,
                        'needs_ordering' => $item['needs_ordering'] ?? false,
                    ]);

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
