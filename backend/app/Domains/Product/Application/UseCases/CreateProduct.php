<?php

namespace App\Domains\Product\Application\UseCases;

use App\Domains\Product\Application\DTO\CreateProductDTO;
use App\Domains\Product\Domain\Models\Product;
use App\Domains\Product\Domain\Repositories\ProductRepositoryInterface;

class CreateProduct
{
    public function __construct(
        private ProductRepositoryInterface $repository
    ) {}

    public function execute(CreateProductDTO $dto): Product
    {
        return $this->repository->create(
            productData: $dto->productData,
            suppliers: $dto->suppliers,
            compatibility: $dto->compatibility,
        );
    }
}