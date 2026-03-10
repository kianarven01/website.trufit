<?php

namespace App\Domains\Auth\Infrastructure\Providers;

use Illuminate\Support\ServiceProvider;
use App\Domains\Auth\Domain\Services\MailServiceInterface;
use App\Domains\Auth\Infrastructure\Services\LaravelMailService;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->bind(MailServiceInterface::class, LaravelMailService::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}