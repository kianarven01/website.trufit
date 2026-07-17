<?php

namespace App\Domains\SalesOrder\Application\UseCases;

use App\Domains\SalesOrder\Domain\Models\SalesOrder;
use App\Domains\Billing\Application\UseCases\CreateBillingStatement;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class CompleteSalesOrder
{
    public function __construct(
        private readonly CreateBillingStatement $createBillingStatement
    ) {}

    public function execute(string $id, ?string $userId = null): SalesOrder
    {
        return DB::transaction(function () use ($id, $userId) {
            $salesOrder = SalesOrder::lockForUpdate()->findOrFail($id);

            if ($salesOrder->type === 'COUNTER') {
                throw new RuntimeException('Counter sales complete after billing.', 422);
            }

            if ($salesOrder->Status !== 'IN_PROGRESS') {
                throw new RuntimeException('Only in-progress sales orders can be completed.', 422);
            }

            $salesOrder->update([
                'Status' => 'COMPLETED',
                'completed_at' => now(),
            ]);

            // Check if billing statement already exists
            $billExists = \App\Domains\Billing\Domain\Models\BillingStatement::where('SOID', $salesOrder->id)
                ->where('status', '!=', 'Cancelled')
                ->exists();

            if (!$billExists) {
                $grandTotal = (float)$salesOrder->Total;
                $subtotal = $grandTotal / 1.12;
                $tax = $grandTotal - $subtotal;

                // Load items with product, category, and linked JO with services
                $salesOrder->load([
                    'items.product.category',
                    'jobOrder.services.serviceType',
                ]);

                // Build billing items from SO items (parts/supplies)
                $billingItems = [];
                foreach ($salesOrder->items as $item) {
                    $type = 'part';
                    if ($item->product) {
                        if ($item->product->category && $item->product->category->is_spol) {
                            $type = 'supply';
                        } elseif ($item->product->item_type) {
                            $type = $item->product->item_type === 'spol' ? 'supply' : $item->product->item_type;
                        }
                    }

                    $billingItems[] = [
                        'name' => $item->product->name ?? 'Unknown',
                        'qty' => $item->quantity,
                        'price' => $item->UnitPrice,
                        'amount' => $item->quantity * $item->UnitPrice,
                        'type' => $type,
                    ];
                }

                // Add JO services (labor) to billing items
                if ($salesOrder->job_order) {
                    foreach ($salesOrder->job_order->services as $joService) {
                        $serviceName = $joService->serviceType->name ?? 'Service';
                        $price = (float) ($joService->PriceAtSale ?? 0);
                        if ($price > 0) {
                            $billingItems[] = [
                                'name' => $serviceName,
                                'qty' => 1,
                                'price' => $price,
                                'amount' => $price,
                                'type' => 'service',
                            ];
                        }
                    }
                }

                $this->createBillingStatement->execute([
                    'customer_id' => $salesOrder->customerID,
                    'so_id' => $salesOrder->id,
                    'jo_id' => $salesOrder->job_order_id,
                    'date' => now(),
                    'total' => $grandTotal,
                    'tax' => round($tax, 2),
                    'vehicle_id' => $salesOrder->vehicle_id,
                    'notes' => 'Automatically generated billing statement from Completed Sales Order ' . ($salesOrder->so_number ?? $salesOrder->id),
                    'items' => $billingItems,
                ]);
            }

            return $salesOrder->fresh();
        });
    }
}
