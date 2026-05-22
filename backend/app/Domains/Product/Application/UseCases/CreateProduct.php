<?php

namespace App\Domains\Product\Application\UseCases;

use App\Domains\Product\Application\DTO\CreateProductDTO;
use App\Domains\Product\Domain\Models\Product;
use App\Domains\Product\Domain\Repositories\ProductRepositoryInterface;
use App\Domains\Inventory\Application\UseCases\CreateInitialInventoryForProduct;

class CreateProduct
{
    public function __construct(
        private ProductRepositoryInterface $repository,
        private CreateInitialInventoryForProduct $createInitialInventoryForProduct
    ) {}

    public function execute(CreateProductDTO $dto): Product
    {
        $product = $this->repository->create(
            productData: $dto->productData,
            suppliers: $dto->productSuppliers,
            compatibility: $dto->compatibility,
        );

        $this->createInitialInventoryForProduct->execute($product->id);

        return $product->fresh([
            'category',
            'manufacturer',
            'unitRelation',
            'suppliers',
            'vehicleCompatibilities',
            'inventoryRelation',
        ]);
    }
}