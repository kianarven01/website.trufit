<?php

namespace App\Domains\Product\Application\DTO;

class ArchiveProductDTO
{
    public function __construct(
        public readonly string $productId,
    ) {
    }

    public static function fromId(string $productId): self
    {
        return new self(
            productId: $productId
        );
    }
}
