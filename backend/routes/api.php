<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Auth\Http\Controllers\AuthController;
use App\Domains\KeyManagement\Http\Controllers\KeyController;
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
| Public Routes
|--------------------------------------------------------------------------
*/

Route::post('/verify-registration-key', [KeyController::class, 'verify']);
Route::post('/register', [KeyController::class, 'register']);

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