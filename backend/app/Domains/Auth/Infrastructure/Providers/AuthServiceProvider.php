<?php

namespace App\Domains\Auth\Infrastructure\Providers;

use Illuminate\Support\ServiceProvider;
use App\Domains\Auth\Domain\Services\MailServiceInterface;
use App\Domains\Auth\Domain\Services\SmsServiceInterface;
use App\Domains\Auth\Domain\Repositories\EmployeeRepositoryInterface;
use App\Domains\Auth\Domain\Repositories\UserRepositoryInterface;
use App\Domains\Auth\Infrastructure\Services\LaravelMailService;
use App\Domains\Auth\Infrastructure\Services\LogSmsService;
use App\Domains\Auth\Infrastructure\Repositories\EloquentEmployeeRepository;
use App\Domains\Auth\Infrastructure\Repositories\EloquentUserRepository;

use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Request;
use Illuminate\Cache\RateLimiting\Limit;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->bind(MailServiceInterface::class, LaravelMailService::class);
        $this->app->bind(SmsServiceInterface::class, LogSmsService::class);
        $this->app->bind(EmployeeRepositoryInterface::class, EloquentEmployeeRepository::class);
        $this->app->bind(UserRepositoryInterface::class, EloquentUserRepository::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(20)->by($request->ip());
        });

        RateLimiter::for('verification', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });
    }
}