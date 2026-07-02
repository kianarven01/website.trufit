<?php

namespace App\Domains\Product\Application\DTO;

class UpdateProductDTO
{
    public function __construct(
        public readonly string $productId,
        public readonly array $data,
    ) {
    }

    public static function fromArray(string $productId, array $data): self
    {
        return new self(
            productId: $productId,
            data: $data,
        );
    }
}
