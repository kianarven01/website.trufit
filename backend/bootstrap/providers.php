<?php

return [
    App\Domains\Shared\Infrastructure\Providers\SharedServiceProvider::class,
    App\Domains\Auth\Infrastructure\Providers\AuthServiceProvider::class,
    App\Domains\Audit\Infrastructure\Providers\AuditServiceProvider::class,
    App\Domains\Customer\Infrastructure\Providers\CustomerServiceProvider::class,
    App\Domains\Estimate\Infrastructure\Providers\EstimateServiceProvider::class,
    App\Domains\Product\Infrastructure\Providers\ProductServiceProvider::class,
];
