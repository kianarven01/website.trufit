<?php

namespace App\Domains\SalesOrder\Application\UseCases;

use App\Domains\SalesOrder\Domain\Models\SalesOrder;
use App\Domains\Inventory\Domain\Models\Inventory;
use App\Domains\SalesOrder\Application\Services\ReserveInventoryService;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class VoidSalesOrder
{
    public function __construct(
        private readonly ReserveInventoryService $reserveInventoryService
    ) {}

    public function execute(string $id, ?string $userId = null): SalesOrder
    {
        return DB::transaction(function () use ($id, $userId) {
            $salesOrder = SalesOrder::lockForUpdate()->findOrFail($id);

            // Void is allowed if it is approved, in progress, or completed
            if (!in_array($salesOrder->Status, ['APPROVED', 'IN_PROGRESS', 'COMPLETED'], true)) {
                throw new RuntimeException('Only approved, in-progress, or completed sales orders can be voided.', 422);
            }

            $items = $salesOrder->items()->lockForUpdate()->get();

            // 1. Return issued items back to stock
            foreach ($items as $item) {
                if ($item->is_issued) {
                    $inventory = Inventory::where('productID', $item->ProductID)
                        ->lockForUpdate()
                        ->first();

                    if (!$inventory) {
                        $inventory = new Inventory();
                        $inventory->productID = $item->ProductID;
                        $inventory->quantity_on_hand = 0;
                        $inventory->reserved_quantity = 0;
                        $defaultLocation = DB::table('Main.StockLocations')->first();
                        if ($defaultLocation) {
                            $inventory->location_id = $defaultLocation->id;
                        }
                        $inventory->save();
                    }

                    $inventory->update([
                        'quantity_on_hand' => $inventory->quantity_on_hand + ($item->quantity - $item->quantity_returned),
                    ]);

                    $item->update([
                        'is_issued' => false,
                        'issued_at' => null,
                        'issued_by' => null,
                    ]);
                }
            }

            // 2. Unreserve any remaining reserved stock
            $this->reserveInventoryService->unreserve($salesOrder);

            // 3. Mark the sales order as cancelled (Voided state is mapped to CANCELLED in DB check constraint)
            $salesOrder->update([
                'Status' => 'CANCELLED',
                'cancelled_by' => $userId,
                'cancelled_at' => now(),
            ]);

            // Cancel any associated active billing statement
            DB::connection('pgsql')
                ->table('Main.BillingStatement')
                ->where('SOID', $salesOrder->id)
                ->where('status', '!=', 'Cancelled')
                ->update(['status' => 'Cancelled']);

            return $salesOrder->fresh();
        });
    }
}
