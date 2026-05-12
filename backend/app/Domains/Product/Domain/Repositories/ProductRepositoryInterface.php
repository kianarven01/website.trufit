<?php

namespace App\Domains\Product\Domain\Repositories;

use App\Domains\Product\Domain\Models\Product;

interface ProductRepositoryInterface
{
    public function create(array $productData, array $suppliers = [], ?array $compatibility = null): Product;
}