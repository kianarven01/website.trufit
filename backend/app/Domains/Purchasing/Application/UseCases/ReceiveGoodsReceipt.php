<?php

namespace App\Domains\Purchasing\Application\UseCases;

use App\Domains\Purchasing\Domain\Models\GoodsReceipt;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ReceiveGoodsReceipt
{
    public function execute(string $id, ?string $userId = null): GoodsReceipt
    {
        return DB::transaction(function () use ($id, $userId) {
            $receipt = GoodsReceipt::lockForUpdate()->findOrFail($id);

            if ($receipt->status !== 'DRAFT') {
                throw new RuntimeException('Only draft goods receipts can be received.', 422);
            }

            $receipt->update([
                'status' => 'SUBMITTED',
                'received_at' => now(),
                'received_by' => $userId,
            ]);

            return $receipt;
        });
    }
}
