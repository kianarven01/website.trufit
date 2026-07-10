<?php

namespace App\Domains\Purchasing\Application\UseCases;

use App\Domains\Purchasing\Domain\Models\PurchaseOrder;
use RuntimeException;

class SubmitPurchaseOrder
{
    public function execute(string $id): PurchaseOrder
    {
        $purchaseOrder = PurchaseOrder::findOrFail($id);

        if ($purchaseOrder->status !== 'DRAFT') {
            throw new RuntimeException('Only draft purchase orders can be submitted.', 422);
        }

        $purchaseOrder->update([
            'status' => 'SUBMITTED',
            'submitted_at' => now(),
        ]);

        return $purchaseOrder;
    }
}
