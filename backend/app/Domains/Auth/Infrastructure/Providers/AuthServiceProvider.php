<?php

namespace App\Domains\Auth\Infrastructure\Providers;

use Illuminate\Support\ServiceProvider;
use App\Domains\Auth\Domain\Services\MailServiceInterface;
use App\Domains\Auth\Domain\Services\SmsServiceInterface;
use App\Domains\Auth\Infrastructure\Services\LaravelMailService;
use App\Domains\Auth\Infrastructure\Services\LogSmsService;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->bind(MailServiceInterface::class, LaravelMailService::class);
        $this->app->bind(SmsServiceInterface::class, LogSmsService::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}