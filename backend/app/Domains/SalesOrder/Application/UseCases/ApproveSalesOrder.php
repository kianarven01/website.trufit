<?php

namespace App\Domains\SalesOrder\Application\UseCases;

use App\Domains\SalesOrder\Domain\Models\SalesOrder;
use App\Domains\SalesOrder\Application\Services\ReserveInventoryService;
use App\Domains\SalesOrder\Application\UseCases\IssueSalesOrderItems;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ApproveSalesOrder
{
    public function __construct(
        private readonly ReserveInventoryService $reserveInventoryService,
        private readonly IssueSalesOrderItems $issueSalesOrderItems
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
                    // Bypass direct database lock issues by loading fresh
                    $this->issueSalesOrderItems->execute($salesOrder->id, $itemIds, $userId);
                }
            }

            return $salesOrder->fresh();
        });
    }
}
