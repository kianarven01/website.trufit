<?php

namespace App\Domains\Purchasing\Application\UseCases;

use App\Domains\Purchasing\Domain\Models\GoodsReceipt;
use App\Domains\Purchasing\Domain\Models\GoodsReceiptItem;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class RequestGoodsReceiptReturn
{
    public function execute(string $goodsReceiptId, array $itemsData, ?string $userId = null): GoodsReceipt
    {
        return DB::transaction(function () use ($goodsReceiptId, $itemsData, $userId) {
            $receipt = GoodsReceipt::with(['items', 'purchaseOrder'])
                ->lockForUpdate()
                ->findOrFail($goodsReceiptId);

            if (!in_array($receipt->status, ['RECEIVED', 'PARTIALLY_RETURNED'])) {
                throw new RuntimeException('Only received or partially returned goods receipts can have return requests.', 422);
            }

            $poItemIds = array_values(array_map(fn ($d) => $d['goods_receipt_item_id'], $itemsData));
            $grItems = GoodsReceiptItem::whereIn('id', $poItemIds)->get()->keyBy('id');
            $purchaseOrderItemIds = $grItems->pluck('purchase_order_item_id')->unique()->values()->all();

            $totalBilledByPoItem = DB::table('SupplierBillItems')
                ->join('SupplierBills', 'SupplierBillItems.supplier_bill_id', '=', 'SupplierBills.id')
                ->whereIn('SupplierBillItems.purchase_order_item_id', $purchaseOrderItemIds)
                ->where('SupplierBills.status', '!=', 'VOID')
                ->select('SupplierBillItems.purchase_order_item_id', DB::raw('SUM("SupplierBillItems"."quantity_billed") as total'))
                ->groupBy('SupplierBillItems.purchase_order_item_id')
                ->pluck('total', 'purchase_order_item_id');

            $totalReceivedByPoItem = DB::table('GoodsReceiptItems')
                ->join('GoodsReceipts', 'GoodsReceiptItems.goods_receipt_id', '=', 'GoodsReceipts.id')
                ->whereIn('GoodsReceiptItems.purchase_order_item_id', $purchaseOrderItemIds)
                ->whereIn('GoodsReceipts.status', ['RECEIVED', 'PARTIALLY_RETURNED', 'RETURNED'])
                ->select('GoodsReceiptItems.purchase_order_item_id', DB::raw('SUM("GoodsReceiptItems"."quantity_received" + COALESCE("GoodsReceiptItems"."quantity_promo", 0)) as total'))
                ->groupBy('GoodsReceiptItems.purchase_order_item_id')
                ->pluck('total', 'purchase_order_item_id');

            $totalReturnedByPoItem = DB::table('GoodsReceiptItems')
                ->join('GoodsReceipts', 'GoodsReceiptItems.goods_receipt_id', '=', 'GoodsReceipts.id')
                ->whereIn('GoodsReceiptItems.purchase_order_item_id', $purchaseOrderItemIds)
                ->whereIn('GoodsReceipts.status', ['RECEIVED', 'PARTIALLY_RETURNED', 'RETURNED'])
                ->select('GoodsReceiptItems.purchase_order_item_id', DB::raw('SUM("GoodsReceiptItems"."quantity_returned") as total'))
                ->groupBy('GoodsReceiptItems.purchase_order_item_id')
                ->pluck('total', 'purchase_order_item_id');

            $requestItems = [];

            foreach ($itemsData as $itemInput) {
                $goodsReceiptItemId = $itemInput['goods_receipt_item_id'];
                $quantityToReturn = (int) $itemInput['quantity_returned'];
                $notes = $itemInput['notes'] ?? null;

                if ($quantityToReturn <= 0) {
                    continue;
                }

                $item = $grItems->get($goodsReceiptItemId);

                if (!$item || $item->goods_receipt_id !== $receipt->id) {
                    throw new RuntimeException("Goods receipt item not found: {$goodsReceiptItemId}", 422);
                }

                $remaining = $item->quantity_received + ($item->quantity_promo ?? 0) - $item->quantity_returned;

                $poItemId = $item->purchase_order_item_id;
                $totalBilled = $totalBilledByPoItem->get($poItemId, 0);
                $totalReceived = $totalReceivedByPoItem->get($poItemId, 0);
                $totalReturned = $totalReturnedByPoItem->get($poItemId, 0);

                $netReceived = $totalReceived - $totalReturned;
                $unbilledReceived = max(0, $netReceived - $totalBilled);
                $allowedReturn = min($remaining, $unbilledReceived);

                if ($quantityToReturn > $allowedReturn) {
                    throw new RuntimeException(
                        "Cannot return {$quantityToReturn} item(s) because {$totalBilled} item(s) have already been billed. " .
                        "Only {$allowedReturn} item(s) are available for return.",
                        422
                    );
                }

                $requestItems[] = [
                    'goods_receipt_item_id' => $goodsReceiptItemId,
                    'quantity_returned' => $quantityToReturn,
                    'notes' => $notes,
                ];
            }

            if (empty($requestItems)) {
                throw new RuntimeException('No items were selected for return.', 422);
            }

            $receipt->update([
                'status' => 'RETURN_REQUESTED',
                'return_request_items' => $requestItems,
                'return_requested_by' => $userId,
                'return_requested_at' => now(),
            ]);

            return $receipt->fresh(['purchaseOrder.supplier', 'items.product', 'items.purchaseOrderItem']);
        });
    }
}
