<?php

return [
    App\Domains\Shared\Infrastructure\Providers\SharedServiceProvider::class,
    App\Domains\Auth\Infrastructure\Providers\AuthServiceProvider::class,
    App\Domains\Audit\Infrastructure\Providers\AuditServiceProvider::class,
    App\Domains\Product\Infrastruture\Providers\ProductServiceProvider::class,
    App\Domains\Vehicle\Infrastructure\Providers\VehicleServiceProvider::class,
];
