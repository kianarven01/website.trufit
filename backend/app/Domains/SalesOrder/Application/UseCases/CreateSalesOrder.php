<?php

namespace App\Domains\SalesOrder\Application\UseCases;

use App\Domains\SalesOrder\Domain\Models\SalesOrder;
use App\Domains\SalesOrder\Domain\Models\SalesOrderItem;
use App\Domains\Estimate\Domain\Models\Estimate;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CreateSalesOrder
{
    public function execute(array $data, ?string $userId = null): SalesOrder
    {
        return DB::transaction(function () use ($data, $userId) {
            do {
                $salesOrderNumber = 'SO-' . now()->format('ymd') . '-' . random_int(1000, 9999);
            } while (SalesOrder::withTrashed()->where('so_number', $salesOrderNumber)->exists());

            $employeeId = auth()->user() ? auth()->user()->employeeID : null;

            if (!$employeeId) {
                $firstEmployee = DB::table('Main.Employees')->first();
                $employeeId = $firstEmployee?->id;
            }

            $estimateId = $data['estimate_id'] ?? null;
            $customerId = $data['customer_id'] ?? null;
            $vehicleId = $data['vehicle_id'] ?? null;
            $items = $data['items'] ?? [];

            // Auto-detect type: REPAIR if linked to estimate, COUNTER otherwise
            $type = $data['type'] ?? ($estimateId ? 'REPAIR' : 'COUNTER');

            if ($estimateId) {
                $estimate = Estimate::with('items')->find($estimateId);
                if ($estimate) {
                    $customerId = $customerId ?? $estimate->customer_id;
                    $vehicleId = $vehicleId ?? $estimate->vehicle_id;

                    if (empty($items)) {
                        foreach ($estimate->items as $estItem) {
                            if (in_array($estItem->item_type, ['part', 'supply'], true)) {
                                $items[] = [
                                    'product_id' => $estItem->product_id,
                                    'quantity' => $estItem->quantity,
                                    'unit_price' => $estItem->unit_price,
                                    'subtotal' => $estItem->subtotal,
                                    'needs_ordering' => $estItem->needs_ordering ?? false,
                                ];
                            }
                        }
                    }
                }
            }

            $totalAmount = 0.00;

            $salesOrder = SalesOrder::create([
                'id' => (string) Str::uuid(),
                'so_number' => $salesOrderNumber,
                'estimate_id' => $estimateId,
                'customerID' => $customerId,
                'vehicle_id' => $vehicleId,
                'employee' => $employeeId,
                'type' => $type,
                'mileage' => $data['mileage'] ?? null,
                'Total' => 0,
                'Balance' => 0,
                'Status' => 'DRAFT',
                'remarks' => $data['notes'] ?? null,
            ]);

            foreach ($items as $item) {
                if (empty($item['product_id'])) {
                    continue;
                }

                $quantity = (int) ($item['quantity'] ?? 1);
                $unitPrice = (float) ($item['unit_price'] ?? 0);
                $subtotal = round($quantity * $unitPrice, 2);

                // Resolve tax code from product supplier if not provided
                $taxAtSale = $item['tax_at_sale'] ?? null;
                if (!$taxAtSale) {
                    $ps = \App\Domains\Supplier\Domain\Models\ProductSupplier::where('product_id', $item['product_id'])->first();
                    $taxAtSale = $ps && $ps->is_vat ? 'VAT' : 'NON_VAT';
                }

                SalesOrderItem::create([
                    'id' => (string) Str::uuid(),
                    'SalesOrderID' => $salesOrder->id,
                    'ProductID' => $item['product_id'],
                    'quantity' => $quantity,
                    'UnitPrice' => $unitPrice,
                    'SubTotal' => $subtotal,
                    'CostAtSale' => $item['cost_at_sale'] ?? 0.00,
                    'TaxAtSale' => $taxAtSale,
                    'needs_ordering' => $item['needs_ordering'] ?? false,
                ]);

                $totalAmount += $subtotal;
            }

            $salesOrder->update([
                'Total' => $totalAmount,
                'Balance' => $totalAmount,
            ]);

            return $salesOrder->load(['customer', 'vehicle', 'estimate', 'items.product', 'creator', 'approvedByUser']);
        });
    }
}
