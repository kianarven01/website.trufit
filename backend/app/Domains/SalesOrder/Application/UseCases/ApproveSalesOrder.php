<?php

namespace App\Domains\SalesOrder\Application\UseCases;

use App\Domains\SalesOrder\Domain\Models\SalesOrder;
use App\Domains\SalesOrder\Domain\Models\SalesOrderItem;
use App\Domains\SalesOrder\Application\Services\ReserveInventoryService;
use App\Domains\SalesOrder\Application\UseCases\IssueSalesOrderItems;
use App\Domains\Billing\Application\UseCases\CreateBillingStatement;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ApproveSalesOrder
{
    public function __construct(
        private readonly ReserveInventoryService $reserveInventoryService,
        private readonly IssueSalesOrderItems $issueSalesOrderItems,
        private readonly CreateBillingStatement $createBillingStatement
    ) {}

    public function execute(string $id, ?string $userId = null): SalesOrder
    {
        return DB::transaction(function () use ($id, $userId) {
            $salesOrder = SalesOrder::lockForUpdate()->findOrFail($id);

            if ($salesOrder->Status !== 'SUBMITTED') {
                throw new RuntimeException('Only submitted sales orders can be approved.', 422);
            }

            $salesOrder->update([
                'Status' => 'APPROVED',
                'approved_by' => $userId,
                'approved_at' => now(),
            ]);

            $this->reserveInventoryService->reserve($salesOrder);

            // For counter sales, automatically issue/deduct stock immediately
            if ($salesOrder->type === 'COUNTER') {
                $itemIds = $salesOrder->items->pluck('id')->toArray();
                if (!empty($itemIds)) {
                    $this->issueSalesOrderItems->execute($salesOrder->id, $itemIds, $userId);
                }

                // Check if billing statement already exists
                $billExists = \App\Domains\Billing\Domain\Models\BillingStatement::where('SOID', $salesOrder->id)
                    ->where('status', '!=', 'Cancelled')
                    ->exists();

                if (!$billExists) {
                    $grandTotal = (float)$salesOrder->Total;

                    // Load items with product and category for name/type/spol checks
                    $salesOrder->load('items.product.category');

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

                    $this->createBillingStatement->execute([
                        'customer_id' => $salesOrder->customerID,
                        'so_id' => $salesOrder->id,
                        'date' => now(),
                        'total' => $grandTotal,
                        'tax' => 0,
                        'vehicle_id' => $salesOrder->vehicle_id,
                        'notes' => 'Automatically generated billing statement from Counter Sales Order ' . ($salesOrder->so_number ?? $salesOrder->id),
                        'items' => $billingItems,
                        'created_by' => $userId,
                    ]);
                }
            }

            return $salesOrder->fresh();
        });
    }
}
