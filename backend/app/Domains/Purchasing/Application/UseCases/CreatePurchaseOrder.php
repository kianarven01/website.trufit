<?php

namespace App\Domains\Purchasing\Application\UseCases;

use App\Domains\Purchasing\Domain\Models\PurchaseOrder;
use App\Domains\Purchasing\Domain\Models\PurchaseOrderItem;
use App\Domains\Purchasing\Application\Services\PurchaseOrderNumberService;
use Illuminate\Support\Facades\DB;

class CreatePurchaseOrder
{
    public function __construct(
        private readonly PurchaseOrderNumberService $numberService
    ) {}

    public function execute(array $data, ?string $userId = null): PurchaseOrder
    {
        return DB::transaction(function () use ($data, $userId) {
            $purchaseOrder = PurchaseOrder::create([
                'po_number' => $this->numberService->generate(),
                'supplier_id' => $data['supplier_id'],
                'order_date' => $data['order_date'] ?? now(),
                'request_ship_date' => $data['request_ship_date'] ?? null,
                'eta' => $data['eta'] ?? $data['request_ship_date'] ?? $data['order_date'] ?? now(),
                'status' => 'DRAFT',
                'remarks' => $data['remarks'] ?? null,
                'subtotal' => 0,
                'total_amount' => 0,
                'created_by' => $userId,
            ]);

            $subtotal = 0;

            foreach ($data['items'] as $item) {
                $poItem = PurchaseOrderItem::create([
                    'purchase_order_id' => $purchaseOrder->id,
                    'product_id' => $item['product_id'],
                    'product_supplier_id' => $item['product_supplier_id'] ?? null,
                    'quantity_ordered' => $item['quantity_ordered'],
                    'unit_cost' => $item['unit_cost'],
                    'notes' => $item['notes'] ?? null,
                ]);

                $subtotal += (float) $poItem->line_total;
            }

            $purchaseOrder->update([
                'subtotal' => $subtotal,
                'total_amount' => $subtotal,
            ]);

            return $purchaseOrder;
        });
    }
}
