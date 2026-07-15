<?php

namespace App\Domains\SalesOrder\Application\UseCases;

use App\Domains\SalesOrder\Domain\Models\SalesOrder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class StartWorkSalesOrder
{
    public function execute(string $id, ?string $userId = null): SalesOrder
    {
        return DB::transaction(function () use ($id, $userId) {
            $salesOrder = SalesOrder::lockForUpdate()->findOrFail($id);

            if ($salesOrder->type === 'COUNTER') {
                throw new RuntimeException('Counter sales do not require work tracking.', 422);
            }

            if ($salesOrder->Status !== 'APPROVED') {
                throw new RuntimeException('Only approved sales orders can be started.', 422);
            }

            $salesOrder->update([
                'Status' => 'IN_PROGRESS',
                'started_by' => $userId,
                'started_at' => now(),
            ]);

            return $salesOrder->fresh();
        });
    }
}
