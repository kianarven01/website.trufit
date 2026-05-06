<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Auth\Http\Controllers\AuthController;
use App\Domains\KeyManagement\Http\Controllers\KeyController;
use App\Domains\Product\Http\Controllers\ProductController;
use App\Domains\Product\Http\Controllers\ProductReferenceController;
use App\Domains\Supplier\Http\Controllers\SupplierController;

/*
|--------------------------------------------------------------------------
| Supplier Reference Routes
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Product Reference Routes
|--------------------------------------------------------------------------
*/

Route::prefix('products')->group(function () {

    Route::get('/', [ProductController::class, 'index']);

    Route::get('/categories', [ProductReferenceController::class, 'categories']);
    Route::get('/units', [ProductReferenceController::class, 'units']);
    Route::get('/suppliers', [SupplierController::class, 'index']);
    Route::get('/vehicles', [ProductReferenceController::class, 'vehicles']);
    Route::post('/vehicles/custom', [ProductReferenceController::class, 'storeCustomVehicle']);
    Route::get('/manufacturers', [ProductReferenceController::class, 'manufacturers']);
    Route::get('/service-types', [ProductReferenceController::class, 'serviceTypes']);
});
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
    // Future Domains will go here:
    // require app_path('Domains/Inventory/routes.php');
    // require app_path('Domains/Sales/routes.php');
});
