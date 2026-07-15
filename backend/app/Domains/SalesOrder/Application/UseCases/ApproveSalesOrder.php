<?php

namespace App\Domains\SalesOrder\Application\UseCases;

use App\Domains\SalesOrder\Domain\Models\SalesOrder;
use App\Domains\SalesOrder\Application\Services\ReserveInventoryService;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ApproveSalesOrder
{
    public function __construct(
        private readonly ReserveInventoryService $reserveInventoryService
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
            ]);

            $this->reserveInventoryService->reserve($salesOrder);

            return $salesOrder->fresh();
        });
    }
}
