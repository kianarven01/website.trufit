<?php

namespace App\Domains\Customer\Infrastructure\Providers;

use Illuminate\Support\ServiceProvider;
use App\Domains\Customer\Domain\Repositories\AppointmentRepositoryInterface;
use App\Domains\Customer\Infrastructure\Repositories\EloquentAppointmentRepository;

class CustomerServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->bind(AppointmentRepositoryInterface::class, EloquentAppointmentRepository::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
