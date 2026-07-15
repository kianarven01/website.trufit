<?php

namespace App\Domains\SalesOrder\Application\UseCases;

use App\Domains\SalesOrder\Domain\Models\SalesOrder;
use App\Domains\SalesOrder\Application\Services\ReserveInventoryService;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class CancelSalesOrder
{
    public function __construct(
        private readonly ReserveInventoryService $reserveInventoryService
    ) {}

    public function execute(string $id, ?string $userId = null): SalesOrder
    {
        return DB::transaction(function () use ($id, $userId) {
            $salesOrder = SalesOrder::lockForUpdate()->findOrFail($id);

            if (in_array($salesOrder->Status, ['CANCELLED', 'COMPLETED'], true)) {
                throw new RuntimeException('This sales order cannot be cancelled.', 422);
            }

            $hasIssuedItems = $salesOrder->items()->where('is_issued', true)->exists();

            if ($hasIssuedItems) {
                throw new RuntimeException(
                    'Cannot cancel sales order with issued items. Please return all issued items first.',
                    422
                );
            }

            $oldStatus = $salesOrder->Status;

            $salesOrder->update([
                'Status' => 'CANCELLED',
                'cancelled_by' => $userId,
                'cancelled_at' => now(),
            ]);

            if (in_array($oldStatus, ['APPROVED', 'IN_PROGRESS'], true)) {
                $this->reserveInventoryService->unreserve($salesOrder);
            }

            return $salesOrder->fresh();
        });
    }
}
