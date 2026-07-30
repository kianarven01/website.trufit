<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Customer\Http\Controllers\CustomerController;
use App\Domains\Customer\Http\Controllers\AppointmentController;

Route::prefix('customers')->group(function () {
    Route::get('/', [CustomerController::class, 'index'])->middleware('check.permission:customers.view,customers.manage');
    Route::get('/{id}', [CustomerController::class, 'show'])->middleware('check.permission:customers.view,customers.manage');
    Route::get('/vehicles/lookup/{plateNumber}', [CustomerController::class, 'lookupVehicle'])->middleware('check.permission:customers.view,customers.manage');
    Route::post('/', [CustomerController::class, 'store'])->middleware('permission:customers.manage');
    Route::put('/{id}', [CustomerController::class, 'update'])->middleware('permission:customers.manage');
    Route::delete('/{id}', [CustomerController::class, 'destroy'])->middleware('permission:customers.manage');
    Route::delete('/{id}/vehicles/{plateNumber}', [CustomerController::class, 'destroyVehicle'])->middleware('permission:customers.manage');
});

Route::prefix('appointments')->group(function () {
    Route::get('/', [AppointmentController::class, 'index'])->middleware('check.permission:appointments.view,appointments.manage');
    Route::post('/', [AppointmentController::class, 'store'])->middleware('permission:appointments.manage');
    Route::put('/{id}', [AppointmentController::class, 'update'])->middleware('permission:appointments.manage');
    Route::delete('/{id}', [AppointmentController::class, 'destroy'])->middleware('permission:appointments.manage');
});

Route::prefix('appointment-notes')->group(function () {
    Route::get('/', [\App\Domains\Customer\Http\Controllers\AppointmentNoteController::class, 'index'])->middleware('check.permission:appointments.view,appointments.manage');
    Route::post('/', [\App\Domains\Customer\Http\Controllers\AppointmentNoteController::class, 'store'])->middleware('permission:appointments.manage');
});
