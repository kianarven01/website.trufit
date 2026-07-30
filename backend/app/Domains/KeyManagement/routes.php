<?php

use Illuminate\Support\Facades\Route;
use App\Domains\KeyManagement\Http\Controllers\KeyController;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/admin/onboard-employee', [KeyController::class, 'store'])->middleware('permission:system.onboard');
    Route::get('/admin/registration-keys', [KeyController::class, 'index'])->middleware('permission:system.onboard');
    Route::post('/admin/registration-keys/{id}/regenerate', [KeyController::class, 'regenerate'])->middleware('permission:system.onboard');
    Route::delete('/admin/registration-keys/{id}', [KeyController::class, 'destroy'])->middleware('permission:system.onboard');
});
