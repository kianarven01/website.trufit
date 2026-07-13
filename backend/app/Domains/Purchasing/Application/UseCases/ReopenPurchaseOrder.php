<?php

namespace App\Domains\Purchasing\Application\UseCases;

use App\Domains\Purchasing\Domain\Models\PurchaseOrder;
use App\Domains\Purchasing\Application\Services\PurchaseOrderStatusService;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ReopenPurchaseOrder
{
    public function execute(string $id, ?string $userId = null): PurchaseOrder
    {
        return DB::transaction(function () use ($id, $userId) {
            $purchaseOrder = PurchaseOrder::lockForUpdate()->findOrFail($id);

            if ($purchaseOrder->status !== 'CLOSED') {
                throw new RuntimeException('Only closed purchase orders can be reopened.', 422);
            }

            $purchaseOrder->update([
                'status' => 'WAITING_TO_RECEIVE',
            ]);

            app(PurchaseOrderStatusService::class)->updateReceiptStatus($purchaseOrder);

            return $purchaseOrder->fresh();
        });
    }
}
