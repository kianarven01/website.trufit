<?php

namespace App\Domains\Purchasing\Application\UseCases;

use App\Domains\Purchasing\Domain\Models\SupplierBill;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ApproveSupplierBill
{
    public function execute(string $id, ?string $userId = null): SupplierBill
    {
        return DB::transaction(function () use ($id, $userId) {
            $bill = SupplierBill::lockForUpdate()->findOrFail($id);

            if ($bill->status !== 'MATCH_EXCEPTION') {
                throw new RuntimeException('Only supplier bills with match exceptions can be approved/overridden.', 422);
            }

            $bill->update([
                'status' => 'AWAITING_PAYMENT',
                'approved_by' => $userId,
            ]);

            return $bill->fresh();
        });
    }
}
