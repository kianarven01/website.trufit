<?php

namespace App\Domains\Purchasing\Application\UseCases;

use App\Domains\Purchasing\Domain\Models\SupplierBill;
use App\Domains\Purchasing\Domain\Models\SupplierBillItem;
use App\Domains\Purchasing\Domain\Models\PurchaseOrder;
use App\Domains\Purchasing\Domain\Models\PurchaseOrderItem;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class CreateSupplierBill
{
    public function execute(array $data, ?string $userId = null): SupplierBill
    {
        return DB::transaction(function () use ($data, $userId) {
            $purchaseOrder = PurchaseOrder::findOrFail($data['purchase_order_id']);

            if (!in_array($purchaseOrder->status, ['WAITING_TO_RECEIVE', 'PARTIALLY_RECEIVED', 'COMPLETED'], true)) {
                throw new RuntimeException('Supplier bills can only be created for active or completed purchase orders.', 422);
            }

            // Check duplicate invoice numbers on this PO
            $exists = SupplierBill::where('purchase_order_id', $purchaseOrder->id)
                ->where('bill_number', $data['bill_number'])
                ->exists();

            if ($exists) {
                throw new RuntimeException("Invoice number '{$data['bill_number']}' has already been recorded for this Purchase Order.", 422);
            }

            // Create temporary draft bill to get ID
            $bill = SupplierBill::create([
                'bill_number' => $data['bill_number'],
                'purchase_order_id' => $purchaseOrder->id,
                'status' => 'DRAFT',
                'bill_date' => $data['bill_date'],
                'due_date' => $data['due_date'],
                'total_amount' => 0,
                'notes' => $data['notes'] ?? null,
                'created_by' => $userId,
            ]);

            $totalAmount = 0;
            $hasDiscrepancy = false;

            foreach ($data['items'] as $itemData) {
                $poItem = PurchaseOrderItem::where('purchase_order_id', $purchaseOrder->id)
                    ->findOrFail($itemData['purchase_order_item_id']);

                // Calculate Net Received
                $netReceived = $poItem->receiptItems()
                    ->whereHas('goodsReceipt', function ($query) {
                        $query->whereIn('status', ['RECEIVED', 'PARTIALLY_RETURNED', 'RETURNED']);
                    })
                    ->selectRaw('SUM(quantity_received - quantity_returned) as total')
                    ->value('total') ?? 0;

                // Calculate Already Billed (excluding void bills)
                $alreadyBilled = SupplierBillItem::where('purchase_order_item_id', $poItem->id)
                    ->whereHas('bill', function ($query) use ($bill) {
                        $query->where('status', '!=', 'VOID');
                    })
                    ->sum('quantity_billed');

                $maxBilled = (int) $netReceived - (int) $alreadyBilled;
                $quantityBilled = (int) $itemData['quantity_billed'];
                $unitPrice = (float) $itemData['unit_price'];

                // Flag discrepancies
                if ($quantityBilled > $maxBilled) {
                    $hasDiscrepancy = true;
                }

                if (abs($unitPrice - (float)$poItem->unit_cost) > 0.01) {
                    $hasDiscrepancy = true;
                }

                $lineTotal = $quantityBilled * $unitPrice;
                $totalAmount += $lineTotal;

                SupplierBillItem::create([
                    'supplier_bill_id' => $bill->id,
                    'purchase_order_item_id' => $poItem->id,
                    'product_id' => $poItem->product_id,
                    'quantity_billed' => $quantityBilled,
                    'unit_price' => $unitPrice,
                    'line_total' => $lineTotal,
                ]);
            }

            // Determine status based on matching
            $status = $hasDiscrepancy ? 'MATCH_EXCEPTION' : 'AWAITING_PAYMENT';

            $bill->update([
                'status' => $status,
                'total_amount' => $totalAmount,
            ]);

            return $bill->fresh('items');
        });
    }
}
