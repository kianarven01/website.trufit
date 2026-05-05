<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Customer\Http\Controllers\CustomerController;

Route::prefix('customers')->group(function () {
    Route::get('/', [CustomerController::class, 'index']);
    Route::get('/{id}', [CustomerController::class, 'show']);
    Route::put('/{id}', [CustomerController::class, 'update']);
    Route::post('/', [CustomerController::class, 'store']);
    Route::delete('/{id}', [CustomerController::class, 'destroy']);
    Route::delete('/{id}/vehicles/{plateNumber}', [CustomerController::class, 'destroyVehicle']);
});
