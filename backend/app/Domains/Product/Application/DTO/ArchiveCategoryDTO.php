<?php

namespace App\Domains\Product\Application\DTO;

class ArchiveCategoryDTO
{
    public function __construct(
        public readonly int|string $categoryId,
    ) {
    }

    public static function fromId(int|string $categoryId): self
    {
        return new self(
            categoryId: $categoryId,
        );
    }
}