<?php

namespace App\Domains\Shared\Infrastructure\Providers;

use Illuminate\Support\ServiceProvider;

class SharedServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Provider is active. 
        // Logic for Resend is currently handled in LaravelMailService to avoid 
        // version conflicts with Laravel 12.
    }
}
