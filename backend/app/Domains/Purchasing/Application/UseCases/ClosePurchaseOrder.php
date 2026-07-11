<?php

namespace App\Domains\Purchasing\Application\UseCases;

use App\Domains\Purchasing\Domain\Models\PurchaseOrder;
use RuntimeException;

class ClosePurchaseOrder
{
    public function execute(string $id, ?string $userId = null): PurchaseOrder
    {
        $purchaseOrder = PurchaseOrder::findOrFail($id);

        if ($purchaseOrder->status !== 'PARTIALLY_RECEIVED') {
            throw new RuntimeException('Only partially received purchase orders can be closed.', 422);
        }

        $purchaseOrder->update([
            'status' => 'CLOSED',
        ]);

        return $purchaseOrder;
    }
}
