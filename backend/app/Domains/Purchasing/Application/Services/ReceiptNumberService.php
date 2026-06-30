<?php

namespace App\Domains\Purchasing\Application\Services;

use App\Domains\Purchasing\Domain\Models\GoodsReceipt;

class ReceiptNumberService
{
    public function generate(): string
    {
        do {
            $receiptNumber = 'GR-' . now()->format('ymd') . '-' . random_int(1000, 9999);
        } while (GoodsReceipt::where('receipt_number', $receiptNumber)->exists());

        return $receiptNumber;
    }
}
