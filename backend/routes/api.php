<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Auth\Http\Controllers\AuthController;
use App\Domains\KeyManagement\Http\Controllers\KeyController;



// Product + Reference routes
require app_path('Domains/Product/routes.php');

// Vehicle routes
require app_path('Domains/Vehicle/routes.php');

// Inventory routes
require app_path('Domains/Inventory/routes.php');


/*
|--------------------------------------------------------------------------
| Supplier Reference Routes
|--------------------------------------------------------------------------
*/

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
    require app_path('Domains/Audit/routes.php');
    require app_path('Domains/Customer/routes.php');
    require app_path('Domains/Estimate/routes.php');
    // Future Domains will go here:
    // require app_path('Domains/Inventory/routes.php');
    // require app_path('Domains/Sales/routes.php');
});
