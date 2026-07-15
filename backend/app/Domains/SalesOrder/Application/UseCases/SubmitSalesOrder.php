<?php

namespace App\Domains\SalesOrder\Application\UseCases;

use App\Domains\SalesOrder\Domain\Models\SalesOrder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class SubmitSalesOrder
{
    public function execute(string $id, ?string $userId = null): SalesOrder
    {
        return DB::transaction(function () use ($id, $userId) {
            $salesOrder = SalesOrder::lockForUpdate()->findOrFail($id);

            if ($salesOrder->Status !== 'DRAFT') {
                throw new RuntimeException('Only draft sales orders can be submitted.', 422);
            }

            $salesOrder->update([
                'Status' => 'SUBMITTED',
                'submitted_by' => $userId,
                'submitted_at' => now(),
            ]);

            return $salesOrder->fresh();
        });
    }
}
