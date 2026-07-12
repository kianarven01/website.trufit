<?php

namespace App\Domains\Purchasing\Application\UseCases;

use App\Domains\Purchasing\Application\Services\StockReceivingService;
use App\Domains\Purchasing\Domain\Models\GoodsReceipt;
use App\Domains\Purchasing\Domain\Models\PurchaseOrder;
use App\Domains\Purchasing\Domain\Models\SupplierBill;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class CancelPurchaseOrder
{
    public function execute(string $id, ?string $userId = null): PurchaseOrder
    {
        $stockService = new StockReceivingService();

        return DB::transaction(function () use ($id, $userId, $stockService) {
            $purchaseOrder = PurchaseOrder::lockForUpdate()->findOrFail($id);

            if (in_array($purchaseOrder->status, ['COMPLETED', 'CANCELLED', 'CLOSED', 'RETURNED'], true)) {
                throw new RuntimeException('This purchase order cannot be cancelled.', 422);
            }

            // 1. Auto-cancel any DRAFT Supplier Bills
            SupplierBill::where('purchase_order_id', $purchaseOrder->id)
                ->where('status', 'DRAFT')
                ->update(['status' => 'VOID']);

            // 2. Auto-cancel any DRAFT Goods Receipts
            GoodsReceipt::where('purchase_order_id', $purchaseOrder->id)
                ->where('status', 'DRAFT')
                ->update(['status' => 'CANCELLED']);

            // 3. Reverse stock for any approved Goods Receipts
            $approvedReceipts = GoodsReceipt::where('purchase_order_id', $purchaseOrder->id)
                ->whereIn('status', ['RECEIVED', 'PARTIALLY_RETURNED'])
                ->get();

            foreach ($approvedReceipts as $receipt) {
                $stockService->undoReceive($receipt);

                $receipt->update(['status' => 'CANCELLED']);
            }

            // 4. Cancel the PO
            $purchaseOrder->update([
                'status' => 'CANCELLED',
                'cancelled_at' => now(),
                'cancelled_by' => $userId,
            ]);

            return $purchaseOrder;
        });
    }
}
