<?php

namespace App\Domains\Purchasing\Application\UseCases;

use App\Domains\Purchasing\Application\Services\PurchaseOrderStatusService;
use App\Domains\Purchasing\Application\Services\Traits\ResolvesDefaultLocation;
use App\Domains\Inventory\Domain\Models\Inventory;
use App\Domains\Product\Domain\Models\Product;
use App\Domains\Purchasing\Domain\Models\GoodsReceipt;
use App\Domains\Purchasing\Domain\Models\GoodsReceiptItem;
use App\Domains\Purchasing\Domain\Models\StockMovement;
use App\Domains\Purchasing\Domain\Models\SupplierBillItem;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ApproveGoodsReceiptReturn
{
    use ResolvesDefaultLocation;

    public function execute(string $goodsReceiptId, ?string $userId = null): array
    {
        return DB::transaction(function () use ($goodsReceiptId, $userId) {
            $receipt = GoodsReceipt::with(['items', 'purchaseOrder'])
                ->lockForUpdate()
                ->findOrFail($goodsReceiptId);

            if ($receipt->status !== 'RETURN_REQUESTED') {
                throw new RuntimeException('This goods receipt does not have a pending return request.', 422);
            }

            $pendingItems = $receipt->return_request_items ?? [];
            if (empty($pendingItems)) {
                throw new RuntimeException('No return items found in the request.', 422);
            }

            $defaultLocationId = $this->getDefaultLocationId();
            if (!$defaultLocationId) {
                throw new RuntimeException('No active warehouse location found.', 422);
            }

            $grItemIds = array_map(fn ($d) => $d['goods_receipt_item_id'], $pendingItems);
            $grItems = GoodsReceiptItem::whereIn('id', $grItemIds)->get()->keyBy('id');

            // Re-check billing status at approval time
            $billedItems = SupplierBillItem::whereIn('purchase_order_item_id', $grItems->pluck('purchase_order_item_id')->filter()->values())
                ->whereHas('bill', fn ($q) => $q->where('status', '!=', 'VOID'))
                ->pluck('purchase_order_item_id')
                ->unique();

            $results = [];
            $anyReturned = false;

            foreach ($pendingItems as $pending) {
                $goodsReceiptItemId = $pending['goods_receipt_item_id'];
                $requestedQty = (int) $pending['quantity_returned'];
                $notes = $pending['notes'] ?? null;

                $item = $grItems->get($goodsReceiptItemId);
                if (!$item) {
                    $results[] = [
                        'goods_receipt_item_id' => $goodsReceiptItemId,
                        'requested' => $requestedQty,
                        'approved' => 0,
                        'reason' => 'Item not found',
                    ];
                    continue;
                }

                // Block return if item has been billed since request
                if ($item->purchase_order_item_id && $billedItems->contains($item->purchase_order_item_id)) {
                    $results[] = [
                        'goods_receipt_item_id' => $goodsReceiptItemId,
                        'requested' => $requestedQty,
                        'approved' => 0,
                        'reason' => 'Item has been billed since return request',
                    ];
                    continue;
                }

                $remaining = $item->quantity_received + ($item->quantity_promo ?? 0) - $item->quantity_returned;
                $approvedQty = min($requestedQty, $remaining);

                if ($approvedQty <= 0) {
                    $results[] = [
                        'goods_receipt_item_id' => $goodsReceiptItemId,
                        'requested' => $requestedQty,
                        'approved' => 0,
                        'reason' => 'No remaining quantity to return',
                    ];
                    continue;
                }

                // Apply UOM conversion for inventory deduction
                $product = $item->product ?? Product::find($item->product_id);
                $conversionFactor = (int) ($product->conversion_factor ?? 1);
                if ($conversionFactor < 1) {
                    $conversionFactor = 1;
                }

                $inventory = Inventory::query()
                    ->where('productID', $item->product_id)
                    ->where('product_supplier_id', $item->product_supplier_id)
                    ->where('location_id', $defaultLocationId)
                    ->lockForUpdate()
                    ->first();

                $onHand = $inventory ? (int) $inventory->quantity_on_hand : 0;
                $approvedInBaseUnits = $approvedQty * $conversionFactor;
                $actualBaseUnits = min($approvedInBaseUnits, $onHand);

                // Calculate how many PO units we can actually return based on available base units
                $actualQty = $conversionFactor > 1
                    ? (int) floor($actualBaseUnits / $conversionFactor)
                    : $actualBaseUnits;
                $actualBaseUnitsToDeduct = $actualQty * $conversionFactor;

                if ($actualQty <= 0) {
                    $results[] = [
                        'goods_receipt_item_id' => $goodsReceiptItemId,
                        'requested' => $requestedQty,
                        'approved' => 0,
                        'reason' => "Insufficient stock (available: {$onHand} base units)",
                    ];
                    continue;
                }

                $inventory->quantity_on_hand = $onHand - $actualBaseUnitsToDeduct;
                $inventory->save();

                // GR item tracks returns in PO units
                $item->quantity_returned = $item->quantity_returned + $actualQty;
                $item->save();

                StockMovement::create([
                    'inventory_id' => $inventory->id,
                    'product_id' => $item->product_id,
                    'product_supplier_id' => $item->product_supplier_id,
                    'movement_type' => 'RETURN',
                    'quantity' => $actualBaseUnitsToDeduct,
                    'reference_type' => 'GOODS_RECEIPT',
                    'reference_id' => $receipt->id,
                    'notes' => 'Return approved: ' . ($notes ?: 'Defective / Excess goods')
                        . ($conversionFactor > 1 ? " [converted: {$actualQty} × {$conversionFactor} = {$actualBaseUnitsToDeduct}]" : ''),
                ]);

                $anyReturned = true;
                $results[] = [
                    'goods_receipt_item_id' => $goodsReceiptItemId,
                    'requested' => $requestedQty,
                    'approved' => $actualQty,
                    'reason' => $actualQty < $requestedQty ? "Partial: only {$actualQty} available" : null,
                ];
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
                'return_request_items' => null,
                'return_requested_by' => null,
                'return_requested_at' => null,
                'returned_by' => $userId,
            ]);

            if ($receipt->purchaseOrder) {
                app(PurchaseOrderStatusService::class)->updateReceiptStatus($receipt->purchaseOrder);
            }

            return [
                'receipt' => $receipt->fresh(['purchaseOrder.supplier', 'items.product', 'items.purchaseOrderItem']),
                'results' => $results,
            ];
        });
    }
}
