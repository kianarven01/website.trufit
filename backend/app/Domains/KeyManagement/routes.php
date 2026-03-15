<?php


use Illuminate\Support\Facades\Route;
use App\Domains\KeyManagement\Http\Controllers\KeyController;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/admin/onboard-employee', [KeyController::class, 'store']);
    Route::get('/admin/registration-keys', [KeyController::class, 'index']);
    Route::post('/admin/registration-keys/{id}/regenerate', [KeyController::class, 'regenerate']);
    Route::delete('/admin/registration-keys/{id}', [KeyController::class, 'destroy']);
});