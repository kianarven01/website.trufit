<?php

namespace App\Domains\Estimate\Infrastructure\Providers;

use Illuminate\Support\ServiceProvider;
use App\Domains\Estimate\Domain\Repositories\EstimateRepositoryInterface;
use App\Domains\Estimate\Infrastructure\Repositories\EloquentEstimateRepository;

class EstimateServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->bind(EstimateRepositoryInterface::class, EloquentEstimateRepository::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
