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
            $today = now();
            $dateStr = $today->format('ymd');
            $prefix = 'SO-' . $dateStr . '-';

            $lastOrder = SalesOrder::where('so_number', 'like', $prefix . '%')
                ->orderBy('so_number', 'desc')
                ->lockForUpdate()
                ->first();

            $nextSequence = 1;
            if ($lastOrder && preg_match('/-(\d+)$/', $lastOrder->so_number, $matches)) {
                $nextSequence = ((int) $matches[1]) + 1;
            }

            $salesOrderNumber = $prefix . str_pad($nextSequence, 3, '0', STR_PAD_LEFT);

            $employeeId = auth()->user() ? auth()->user()->employeeID : null;

            if (!$employeeId) {
                $firstEmployee = DB::table('Main.Employees')->first();
                $employeeId = $firstEmployee?->id;
            }

            $estimateId = $data['estimate_id'] ?? null;
            $customerId = $data['customer_id'] ?? null;
            $vehicleId = $data['vehicle_id'] ?? null;
            $items = $data['items'] ?? [];

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
                'mileage' => $data['mileage'] ?? null,
                'Total' => 0,
                'Balance' => 0,
                'Status' => 'DRAFT',
                'StockAvailability' => 'IN_STOCK',
                'remarks' => $data['notes'] ?? null,
            ]);

            foreach ($items as $item) {
                if (empty($item['product_id'])) {
                    continue;
                }

                $quantity = (int) ($item['quantity'] ?? 1);
                $unitPrice = (float) ($item['unit_price'] ?? 0);
                $subtotal = round($quantity * $unitPrice, 2);

                SalesOrderItem::create([
                    'id' => (string) Str::uuid(),
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

            return $salesOrder->load(['customer', 'vehicle', 'estimate', 'items.product', 'creator', 'approver']);
        });
    }
}
