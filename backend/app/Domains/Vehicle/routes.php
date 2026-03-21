<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Vehicle\Http\Controllers\VehicleController;

Route::prefix('vehicles')->group(function () {
    Route::get('/', [VehicleController::class, 'index']);
    Route::get('/manufacturers', [VehicleController::class, 'manufacturers']);
    Route::post('/', [VehicleController::class, 'store']);
    Route::put('/{id}', [VehicleController::class, 'update']);
    Route::delete('/{id}', [VehicleController::class, 'destroy']);

    Route::get('/models/{carModelId}/variants', [VehicleController::class, 'getVariants']);
    Route::post('/models/{carModelId}/variants', [VehicleController::class, 'storeVariant']);

    Route::put('/variants/{variantId}', [VehicleController::class, 'updateVariant']);
    Route::delete('/variants/{variantId}', [VehicleController::class, 'destroyVariant']);
});