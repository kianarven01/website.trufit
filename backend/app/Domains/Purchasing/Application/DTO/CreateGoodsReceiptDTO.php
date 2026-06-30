<?php

namespace App\Domains\Purchasing\Application\DTO;

class CreateGoodsReceiptDTO
{
    public function __construct(
        public readonly string $purchaseOrderId,
        public readonly array $items,
        public readonly ?string $notes = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            purchaseOrderId: $data['purchase_order_id'],
            items: $data['items'],
            notes: $data['notes'] ?? null,
        );
    }
}
