<?php

namespace App\Domains\SalesOrder\Application\UseCases;

use App\Domains\SalesOrder\Domain\Models\SalesOrder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ReopenSalesOrder
{
    public function execute(string $id, ?string $userId = null): SalesOrder
    {
        return DB::transaction(function () use ($id, $userId) {
            $salesOrder = SalesOrder::lockForUpdate()->findOrFail($id);

            if ($salesOrder->Status !== 'COMPLETED') {
                throw new RuntimeException('Only completed sales orders can be reopened.', 422);
            }

            $salesOrder->update([
                'Status' => 'IN_PROGRESS',
                'completed_at' => null,
            ]);

            return $salesOrder->fresh();
        });
    }
}
