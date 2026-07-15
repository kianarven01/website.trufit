<?php

namespace App\Domains\SalesOrder\Application\UseCases;

use App\Domains\SalesOrder\Domain\Models\SalesOrder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class CloseSalesOrder
{
    public function execute(string $id, ?string $userId = null): SalesOrder
    {
        return DB::transaction(function () use ($id, $userId) {
            $salesOrder = SalesOrder::lockForUpdate()->findOrFail($id);

            if ($salesOrder->Status !== 'IN_PROGRESS') {
                throw new RuntimeException('Only in-progress sales orders can be completed.', 422);
            }

            $salesOrder->update([
                'Status' => 'COMPLETED',
                'completed_at' => now(),
            ]);

            return $salesOrder->fresh();
        });
    }
}
