<?php

namespace App\Domains\Purchasing\Application\UseCases;

use App\Domains\Purchasing\Domain\Models\PurchaseOrder;
use App\Domains\Purchasing\Application\Services\PurchaseOrderStatusService;
use RuntimeException;

class ReopenPurchaseOrder
{
    public function execute(string $id, ?string $userId = null): PurchaseOrder
    {
        $purchaseOrder = PurchaseOrder::findOrFail($id);

        if ($purchaseOrder->status !== 'CLOSED') {
            throw new RuntimeException('Only closed purchase orders can be reopened.', 422);
        }

        // Set to a temporary state to bypass the CLOSED/CANCELLED guard in the service
        $purchaseOrder->update([
            'status' => 'WAITING_TO_RECEIVE',
        ]);

        app(PurchaseOrderStatusService::class)->updateReceiptStatus($purchaseOrder);

        return $purchaseOrder->fresh();
    }
}
