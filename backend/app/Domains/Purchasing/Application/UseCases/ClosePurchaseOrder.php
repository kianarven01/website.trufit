<?php

namespace App\Domains\Purchasing\Application\UseCases;

use App\Domains\Purchasing\Domain\Models\PurchaseOrder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ClosePurchaseOrder
{
    public function execute(string $id, ?string $userId = null): PurchaseOrder
    {
        return DB::transaction(function () use ($id, $userId) {
            $purchaseOrder = PurchaseOrder::lockForUpdate()->findOrFail($id);

            if (!in_array($purchaseOrder->status, ['WAITING_TO_RECEIVE', 'PARTIALLY_RECEIVED'], true)) {
                throw new RuntimeException('Only waiting-to-receive or partially received purchase orders can be closed.', 422);
            }

            $purchaseOrder->update([
                'status' => 'CLOSED',
            ]);

            return $purchaseOrder;
        });
    }
}
