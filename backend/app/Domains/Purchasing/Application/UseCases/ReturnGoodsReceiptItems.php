<?php

namespace App\Domains\Purchasing\Application\UseCases;

use App\Domains\Purchasing\Application\Services\PurchaseOrderStatusService;
use App\Domains\Purchasing\Application\Services\Traits\ResolvesDefaultLocation;
use App\Domains\Inventory\Domain\Models\Inventory;
use App\Domains\Product\Domain\Models\Product;
use App\Domains\Purchasing\Domain\Models\GoodsReceipt;
use App\Domains\Purchasing\Domain\Models\GoodsReceiptItem;
use App\Domains\Purchasing\Domain\Models\StockMovement;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ReturnGoodsReceiptItems
{
    use ResolvesDefaultLocation;

    public function execute(string $goodsReceiptId, array $itemsData, ?string $userId = null): GoodsReceipt
    {
        return DB::transaction(function () use ($goodsReceiptId, $itemsData, $userId) {
            $receipt = GoodsReceipt::with(['items', 'purchaseOrder'])
                ->lockForUpdate()
                ->findOrFail($goodsReceiptId);

            if (!in_array($receipt->status, ['RECEIVED', 'PARTIALLY_RETURNED'])) {
                throw new RuntimeException('Only received or partially returned goods receipts can have items returned.', 422);
            }

            $defaultLocationId = $this->getDefaultLocationId();
            if (!$defaultLocationId) {
                throw new RuntimeException('No active warehouse location found.', 422);
            }

            // Pre-calculate bulk aggregates per purchase_order_item_id to avoid N+1
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

            $returnedCount = 0;

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
                        "Cannot return {$quantityToReturn} item(s) because {$totalBilled} item(s) have already been billed out of {$totalReceived} received. " .
                        "Only {$unbilledReceived} unbilled item(s) are available for return.",
                        422
                    );
                }

                // Apply UOM conversion for inventory deduction
                $product = $item->product ?? Product::find($item->product_id);
                $conversionFactor = (int) ($product->conversion_factor ?? 1);
                if ($conversionFactor < 1) {
                    $conversionFactor = 1;
                }
                $quantityToDeductInBaseUnits = $quantityToReturn * $conversionFactor;

                $inventory = Inventory::query()
                    ->where('productID', $item->product_id)
                    ->where('product_supplier_id', $item->product_supplier_id)
                    ->where('location_id', $defaultLocationId)
                    ->lockForUpdate()
                    ->first();

                if (!$inventory || (int)$inventory->quantity_on_hand < $quantityToDeductInBaseUnits) {
                    $onHand = $inventory ? $inventory->quantity_on_hand : 0;
                    throw new RuntimeException("Cannot return item. Insufficient stock on hand (requested: {$quantityToDeductInBaseUnits} base units, available: {$onHand}).", 422);
                }

                $inventory->quantity_on_hand = (int) $inventory->quantity_on_hand - $quantityToDeductInBaseUnits;
                $inventory->save();

                // GR item tracks returns in PO units (drums)
                $item->quantity_returned = $item->quantity_returned + $quantityToReturn;
                $item->save();

                StockMovement::create([
                    'inventory_id' => $inventory->id,
                    'product_id' => $item->product_id,
                    'product_supplier_id' => $item->product_supplier_id,
                    'movement_type' => 'RETURN',
                    'quantity' => $quantityToDeductInBaseUnits,
                    'reference_type' => 'GOODS_RECEIPT',
                    'reference_id' => $receipt->id,
                    'notes' => 'Return items: ' . ($notes ? $notes : 'Defective / Excess goods')
                        . ($conversionFactor > 1 ? " [converted: {$quantityToReturn} × {$conversionFactor} = {$quantityToDeductInBaseUnits}]" : ''),
                ]);

                $returnedCount++;
            }

            if ($returnedCount === 0) {
                throw new RuntimeException('No items were selected for return.', 422);
            }

            $receipt->load('items');
            $totalReceived = $receipt->items->sum('quantity_received');
            $totalPromo = $receipt->items->sum('quantity_promo');
            $totalUnits = $totalReceived + $totalPromo;
            $totalReturned = $receipt->items->sum('quantity_returned');

            if ($totalReturned >= $totalUnits) {
                $newStatus = 'RETURNED';
            } elseif ($totalReturned > 0) {
                $newStatus = 'PARTIALLY_RETURNED';
            } else {
                $newStatus = 'RECEIVED';
            }

            $receipt->update([
                'status' => $newStatus,
                'returned_by' => $userId,
            ]);

            if ($receipt->purchaseOrder) {
                app(PurchaseOrderStatusService::class)->updateReceiptStatus($receipt->purchaseOrder);
            }

            return $receipt->fresh(['purchaseOrder.supplier', 'items.product', 'items.purchaseOrderItem']);
        });
    }
}
