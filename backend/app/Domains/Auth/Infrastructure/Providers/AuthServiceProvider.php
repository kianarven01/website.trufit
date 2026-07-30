<?php

namespace App\Domains\Auth\Infrastructure\Providers;

use Illuminate\Support\ServiceProvider;
use App\Domains\Auth\Domain\Services\MailServiceInterface;
use App\Domains\Auth\Domain\Services\SmsServiceInterface;
use App\Domains\Auth\Domain\Repositories\EmployeeRepositoryInterface;
use App\Domains\Auth\Domain\Repositories\UserRepositoryInterface;
use App\Domains\Auth\Infrastructure\Services\LaravelMailService;
use App\Domains\Auth\Infrastructure\Services\RateLimitedMailService;
use App\Domains\Auth\Infrastructure\Services\LogSmsService;
use App\Domains\Auth\Infrastructure\Repositories\EloquentEmployeeRepository;
use App\Domains\Auth\Infrastructure\Repositories\EloquentUserRepository;

use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Gate;
use Illuminate\Http\Request;
use Illuminate\Cache\RateLimiting\Limit;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->bind(MailServiceInterface::class, function ($app) {
            return new RateLimitedMailService(
                inner: $app->make(LaravelMailService::class),
                dailyLimit: (int) env('MAIL_DAILY_LIMIT', 80),
                monthlyLimit: (int) env('MAIL_MONTHLY_LIMIT', 2500),
            );
        });
        $this->app->bind(SmsServiceInterface::class, LogSmsService::class);
        $this->app->bind(EmployeeRepositoryInterface::class, EloquentEmployeeRepository::class);
        $this->app->bind(UserRepositoryInterface::class, EloquentUserRepository::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        $this->registerGates();
        $this->registerRateLimiters();
    }

    private function registerGates(): void
    {
        $permissions = [
            'appointments.view',
            'appointments.manage',
            'customers.view',
            'customers.manage',
            'services.view_job_orders',
            'services.manage_job_orders',
            'services.manage_catalog',
            'sales.view',
            'sales.manage',
            'products.view',
            'products.manage',
            'purchasing.view',
            'purchasing.manage',
            'system.manage_employees',
            'system.onboard',
            'system.manage_roles',
        ];

        foreach ($permissions as $permission) {
            Gate::define($permission, function ($user) use ($permission) {
                if (!$user->employee || !$user->employee->role) {
                    return false;
                }
                $userPermissions = $user->employee->role->permissions ?? [];
                return in_array($permission, $userPermissions);
            });
        }

        Gate::define('permission', function ($user, string $permission) {
            if (!$user->employee || !$user->employee->role) {
                return false;
            }
            $permissions = $user->employee->role->permissions ?? [];
            return in_array($permission, $permissions);
        });

        Gate::define('role', function ($user, string ...$roles) {
            if (!$user->employee || !$user->employee->role) {
                return false;
            }
            return in_array(strtolower($user->employee->role->name), array_map('strtolower', $roles));
        });

        Gate::before(function ($user) {
            if ($user->employee && strtolower($user->employee->role->name) === 'admin') {
                return true;
            }
            return null;
        });
    }

    private function registerRateLimiters(): void
    {
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(20)->by($request->ip());
        });

        RateLimiter::for('verification', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });
    }
}