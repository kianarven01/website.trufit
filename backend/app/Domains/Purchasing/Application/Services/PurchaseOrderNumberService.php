<?php

namespace App\Domains\Purchasing\Application\Services;

use App\Domains\Purchasing\Domain\Models\PurchaseOrder;

class PurchaseOrderNumberService
{
    public function generate(): string
    {
        do {
            $poNumber = 'PO-' . now()->format('ymd') . '-' . random_int(1000, 9999);
        } while (PurchaseOrder::where('po_number', $poNumber)->exists());

        return $poNumber;
    }
}
