<?php

namespace App\Domains\Purchasing\Application\UseCases;

use App\Domains\Purchasing\Domain\Models\PurchaseOrder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class SubmitPurchaseOrder
{
    public function execute(string $id, ?string $userId = null): PurchaseOrder
    {
        return DB::transaction(function () use ($id, $userId) {
            $purchaseOrder = PurchaseOrder::lockForUpdate()->findOrFail($id);

            if ($purchaseOrder->status !== 'DRAFT') {
                throw new RuntimeException('Only draft purchase orders can be submitted.', 422);
            }

            $purchaseOrder->update([
                'status' => 'SUBMITTED',
                'submitted_at' => now(),
                'submitted_by' => $userId,
            ]);

            return $purchaseOrder;
        });
    }
}
