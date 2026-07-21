<?php

namespace App\Domains\SalesOrder\Application\UseCases;

use App\Domains\SalesOrder\Domain\Models\SalesOrder;
use App\Domains\SalesOrder\Application\Services\ReserveInventoryService;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ReopenSalesOrder
{
    public function __construct(
        private readonly ReserveInventoryService $reserveInventoryService
    ) {}

    public function execute(string $id, ?string $userId = null): SalesOrder
    {
        return DB::transaction(function () use ($id, $userId) {
            $salesOrder = SalesOrder::lockForUpdate()->findOrFail($id);

            if ($salesOrder->Status === 'COMPLETED') {
                // Reopen completed → IN_PROGRESS
                $salesOrder->update([
                    'Status' => 'IN_PROGRESS',
                    'completed_at' => null,
                ]);
            } elseif ($salesOrder->Status === 'CANCELLED') {
                // Reopen cancelled/voided → APPROVED (re-reserve stock)
                if ($salesOrder->type !== 'COUNTER') {
                    $this->reserveInventoryService->reserve($salesOrder);
                }
                $salesOrder->update([
                    'Status' => 'APPROVED',
                    'cancelled_at' => null,
                    'cancelled_by' => null,
                ]);
            } else {
                throw new RuntimeException('Only completed or cancelled sales orders can be reopened.', 422);
            }

            return $salesOrder->fresh();
        });
    }
}
