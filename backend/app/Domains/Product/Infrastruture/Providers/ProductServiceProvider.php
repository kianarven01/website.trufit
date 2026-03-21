<?php

namespace App\Domains\Product\Infrastruture\Providers;

use Illuminate\Support\ServiceProvider;
use App\Domains\Product\Domain\Repositories\CategoryRepositoryInterface;
use App\Domains\Product\Infrastruture\Repositories\EloquentCategoryRepository;

class ProductServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(CategoryRepositoryInterface::class, EloquentCategoryRepository::class);
    }
}
