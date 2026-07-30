<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Vehicle\Http\Controllers\VehicleController;
use App\Domains\Vehicle\Http\Controllers\ManufacturerController;

Route::get('/vehicles/manufacturers', [ManufacturerController::class, 'index'])->middleware('check.permission:products.view,products.manage');
Route::post('/manufacturers', [ManufacturerController::class, 'store'])->middleware('permission:products.manage');

Route::prefix('vehicles')->group(function () {
    Route::get('/', [VehicleController::class, 'index'])->middleware('check.permission:products.view,products.manage');
    Route::get('/manufacturers', [VehicleController::class, 'manufacturers'])->middleware('check.permission:products.view,products.manage');
    Route::post('/', [VehicleController::class, 'store'])->middleware('permission:products.manage');
    Route::put('/{id}', [VehicleController::class, 'update'])->middleware('permission:products.manage');
    Route::delete('/{id}', [VehicleController::class, 'destroy'])->middleware('permission:products.manage');

    Route::get('/models/{carModelId}/variants', [VehicleController::class, 'getVariants'])->middleware('check.permission:products.view,products.manage');
    Route::post('/models/{carModelId}/variants', [VehicleController::class, 'storeVariant'])->middleware('permission:products.manage');

    Route::put('/variants/{variantId}', [VehicleController::class, 'updateVariant'])->middleware('permission:products.manage');
    Route::delete('/variants/{variantId}', [VehicleController::class, 'destroyVariant'])->middleware('permission:products.manage');
});