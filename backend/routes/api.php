<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Auth\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| Authentication Domain
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    // Public & Private Auth Routes (Login, Register, Logout)
    require app_path('Domains/Auth/routes.php');

    // Identity Verification
    Route::middleware('auth:sanctum')->get('/verify', [AuthController::class, 'verify']);
});

/*
|--------------------------------------------------------------------------
| Admin & Management Domains (Protected)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    
    // Employee & Key Management Domain
    require app_path('Domains/Employee/routes.php');
    require app_path('Domains/KeyManagement/routes.php');
    // Future Domains will go here:
    // require app_path('Domains/Inventory/routes.php');
    // require app_path('Domains/Sales/routes.php');
});