<?php

namespace App\Domains\Customer\Infrastructure\Providers;

use Illuminate\Support\ServiceProvider;
use App\Domains\Customer\Domain\Repositories\AppointmentRepositoryInterface;
use App\Domains\Customer\Domain\Repositories\CustomerRepositoryInterface;
use App\Domains\Customer\Infrastructure\Repositories\EloquentAppointmentRepository;
use App\Domains\Customer\Infrastructure\Repositories\EloquentCustomerRepository;

class CustomerServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->bind(AppointmentRepositoryInterface::class, EloquentAppointmentRepository::class);
        $this->app->bind(CustomerRepositoryInterface::class, EloquentCustomerRepository::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
