<?php

namespace App\Domains\Product\Infrastructure\Providers;

use Illuminate\Support\ServiceProvider;
use App\Domains\Product\Domain\Repositories\CategoryRepositoryInterface;
use App\Domains\Product\Domain\Repositories\ProductRepositoryInterface;
use App\Domains\Product\Infrastructure\Repositories\EloquentCategoryRepository;
use App\Domains\Product\Infrastructcure\Repositories\EloquentProductRepository;

class ProductServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            CategoryRepositoryInterface::class,
            EloquentCategoryRepository::class
        );

        $this->app->bind(
            ProductRepositoryInterface::class,
            EloquentProductRepository::class
        );
    }
}