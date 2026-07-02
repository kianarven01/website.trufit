<?php

namespace App\Domains\Product\Application\UseCases;

use App\Domains\Product\Application\DTO\ArchiveProductDTO;
use App\Domains\Product\Application\Services\ProductArchiveService;

class ArchiveProduct
{
    public function __construct(
        private readonly ProductArchiveService $productArchiveService,
    ) {
    }

    public function execute(ArchiveProductDTO $dto): array
    {
        return $this->productArchiveService->archive($dto->productId);
    }
}
