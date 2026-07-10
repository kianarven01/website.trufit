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

    public function execute(array $data): PurchaseOrder
    {
        return DB::transaction(function () use ($data) {
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
            ]);

            $subtotal = 0;

            foreach ($data['items'] as $item) {
                $lineTotal = (float) $item['quantity_ordered'] * (float) $item['unit_cost'];

                PurchaseOrderItem::create([
                    'purchase_order_id' => $purchaseOrder->id,
                    'product_id' => $item['product_id'],
                    'product_supplier_id' => $item['product_supplier_id'] ?? null,
                    'quantity_ordered' => $item['quantity_ordered'],
                    'unit_cost' => $item['unit_cost'],
                    'line_total' => $lineTotal,
                    'notes' => $item['notes'] ?? null,
                ]);

                $subtotal += $lineTotal;
            }

            $purchaseOrder->update([
                'subtotal' => $subtotal,
                'total_amount' => $subtotal,
            ]);

            return $purchaseOrder;
        });
    }
}
