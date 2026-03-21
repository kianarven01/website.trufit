<?php

namespace App\Domains\Vehicle\Infrastructure\Providers;

use Illuminate\Support\ServiceProvider;
use App\Domains\Vehicle\Domain\Repositories\VehicleVariantRepositoryInterface;
use App\Domains\Vehicle\Infrastructure\Repositories\EloquentVehicleVariantRepository;

class VehicleServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(VehicleVariantRepositoryInterface::class, EloquentVehicleVariantRepository::class);
    }
}
