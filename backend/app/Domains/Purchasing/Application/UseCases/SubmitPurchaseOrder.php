<?php

namespace App\Domains\Purchasing\Application\UseCases;

use App\Domains\Purchasing\Domain\Models\PurchaseOrder;
use RuntimeException;

class SubmitPurchaseOrder
{
    public function execute(string $id, ?string $userId = null): PurchaseOrder
    {
        $purchaseOrder = PurchaseOrder::findOrFail($id);

        if ($purchaseOrder->status !== 'DRAFT') {
            throw new RuntimeException('Only draft purchase orders can be submitted.', 422);
        }

        $purchaseOrder->update([
            'status' => 'SUBMITTED',
            'submitted_at' => now(),
            'submitted_by' => $userId,
        ]);

        return $purchaseOrder;
    }
}
