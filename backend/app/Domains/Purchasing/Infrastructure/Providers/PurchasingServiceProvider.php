<?php

namespace App\Domains\Purchasing\Infrastructure\Providers;

use Illuminate\Support\ServiceProvider;
use App\Domains\Purchasing\Domain\Repositories\PurchaseOrderRepositoryInterface;
use App\Domains\Purchasing\Domain\Repositories\GoodsReceiptRepositoryInterface;
use App\Domains\Purchasing\Infrastructure\Repositories\EloquentPurchaseOrderRepository;
use App\Domains\Purchasing\Infrastructure\Repositories\EloquentGoodsReceiptRepository;

class PurchasingServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(PurchaseOrderRepositoryInterface::class, EloquentPurchaseOrderRepository::class);
        $this->app->bind(GoodsReceiptRepositoryInterface::class, EloquentGoodsReceiptRepository::class);
    }

    public function boot(): void
    {
        //
    }
}
