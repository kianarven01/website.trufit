<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Customer\Http\Controllers\CustomerController;
use App\Domains\Customer\Http\Controllers\AppointmentController;

Route::prefix('customers')->group(function () {
    Route::get('/', [CustomerController::class, 'index']);
    Route::get('/{id}', [CustomerController::class, 'show']);
    Route::put('/{id}', [CustomerController::class, 'update']);
    Route::post('/', [CustomerController::class, 'store']);
    Route::delete('/{id}', [CustomerController::class, 'destroy']);
    Route::delete('/{id}/vehicles/{plateNumber}', [CustomerController::class, 'destroyVehicle']);
    Route::get('/vehicles/lookup/{plateNumber}', [CustomerController::class, 'lookupVehicle']);
});

Route::prefix('appointments')->group(function () {
    Route::get('/', [AppointmentController::class, 'index']);
    Route::post('/', [AppointmentController::class, 'store']);
    Route::put('/{id}', [AppointmentController::class, 'update']);
    Route::delete('/{id}', [AppointmentController::class, 'destroy']);
});

Route::prefix('appointment-notes')->group(function () {
    Route::get('/', [\App\Domains\Customer\Http\Controllers\AppointmentNoteController::class, 'index']);
    Route::post('/', [\App\Domains\Customer\Http\Controllers\AppointmentNoteController::class, 'store']);
});
