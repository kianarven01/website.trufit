<?php

namespace App\Domains\Purchasing\Application\UseCases;

use App\Domains\Purchasing\Domain\Models\PurchaseOrder;
use RuntimeException;

class ApprovePurchaseOrder
{
    public function execute(string $id, ?string $userId = null): PurchaseOrder
    {
        $purchaseOrder = PurchaseOrder::findOrFail($id);

        if ($purchaseOrder->status !== 'SUBMITTED') {
            throw new RuntimeException('Only submitted purchase orders can be approved.', 422);
        }

        $purchaseOrder->update([
            'status' => 'WAITING_TO_RECEIVE',
            'approved_at' => now(),
            'approved_by' => $userId,
        ]);

        return $purchaseOrder;
    }
}
