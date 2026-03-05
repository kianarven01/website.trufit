<?php

use Illuminate\Support\Facades\Route;

// Automatically load routes from all Domains
foreach (glob(app_path('Domains/*/routes.php')) as $routeFile) {
    Route::group([], function () use ($routeFile) {
        require $routeFile;
    });
}