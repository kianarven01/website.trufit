<?php

namespace App\Domains\Audit\Infrastructure\Providers;

use Illuminate\Support\ServiceProvider;
use App\Domains\Audit\Domain\Repositories\AuditRepositoryInterface;
use App\Domains\Audit\Infrastructure\Repositories\EloquentAuditRepository;
use App\Domains\Shared\Domain\Services\AuditServiceInterface;
use App\Domains\Audit\Infrastructure\Services\AuditService;

class AuditServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(AuditRepositoryInterface::class, EloquentAuditRepository::class);
        $this->app->singleton(AuditServiceInterface::class, AuditService::class);
    }
}