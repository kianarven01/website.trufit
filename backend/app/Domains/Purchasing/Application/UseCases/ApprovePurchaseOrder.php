<?php

namespace App\Domains\Purchasing\Application\UseCases;

use App\Domains\Purchasing\Domain\Models\PurchaseOrder;
use RuntimeException;

class ApprovePurchaseOrder
{
    public function execute(string $id): PurchaseOrder
    {
        $purchaseOrder = PurchaseOrder::findOrFail($id);

        if ($purchaseOrder->status !== 'SUBMITTED') {
            throw new RuntimeException('Only submitted purchase orders can be approved.', 422);
        }

        $purchaseOrder->update([
            'status' => 'APPROVED',
            'approved_at' => now(),
        ]);

        return $purchaseOrder;
    }
}
