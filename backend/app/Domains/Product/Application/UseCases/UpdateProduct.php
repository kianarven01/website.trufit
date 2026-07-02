<?php

namespace App\Domains\Product\Application\UseCases;

use App\Domains\Product\Application\DTO\UpdateProductDTO;
use App\Domains\Product\Application\Services\ProductUpdateService;
use App\Domains\Product\Domain\Models\Product;

class UpdateProduct
{
    public function __construct(
        private readonly ProductUpdateService $productUpdateService,
    ) {
    }

    public function execute(UpdateProductDTO $dto): Product
    {
        return $this->productUpdateService->update($dto);
    }
}
