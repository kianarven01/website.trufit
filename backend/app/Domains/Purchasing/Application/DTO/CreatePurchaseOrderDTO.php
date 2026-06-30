<?php

namespace App\Domains\Purchasing\Application\DTO;

class CreatePurchaseOrderDTO
{
    public function __construct(
        public readonly string $supplierId,
        public readonly array $items,
        public readonly ?string $orderDate = null,
        public readonly ?string $requestShipDate = null,
        public readonly ?string $eta = null,
        public readonly ?string $remarks = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            supplierId: $data['supplier_id'],
            items: $data['items'],
            orderDate: $data['order_date'] ?? null,
            requestShipDate: $data['request_ship_date'] ?? null,
            eta: $data['eta'] ?? null,
            remarks: $data['remarks'] ?? null,
        );
    }
}
