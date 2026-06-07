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
        $product = $this->repository->create(
            productData: $dto->productData,
            suppliers: $dto->productSuppliers,
            compatibility: $dto->compatibility,
        );

        return $product->fresh([
            'category',
            'part',
            'manufacturer',
            'unitRelation',
            'productSuppliers.supplier',
            'productSuppliers.price',
            'inventoryRows.productSupplier.supplier',
            'inventoryRows.productSupplier.price',
            'vehicleCompatibilities',
        ]);
    }
}