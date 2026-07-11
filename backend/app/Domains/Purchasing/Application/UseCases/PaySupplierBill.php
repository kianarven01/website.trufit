<?php

namespace App\Domains\Purchasing\Application\UseCases;

use App\Domains\Purchasing\Domain\Models\SupplierBill;
use RuntimeException;

class PaySupplierBill
{
    public function execute(string $id, ?string $userId = null): SupplierBill
    {
        $bill = SupplierBill::findOrFail($id);

        if ($bill->status !== 'AWAITING_PAYMENT') {
            throw new RuntimeException('Only approved supplier bills awaiting payment can be paid.', 422);
        }

        $bill->update([
            'status' => 'PAID',
            'paid_by' => $userId,
            'paid_at' => now(),
        ]);

        return $bill->fresh();
    }
}
