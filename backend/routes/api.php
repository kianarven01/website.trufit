<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\RegistrationKeyController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
//Route::post('/admin/generate-key', [RegistrationKeyController::class, 'generate']);
Route::post('/verify-registration-key', [RegistrationKeyController::class, 'verify']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    //for admin
    Route::post('/admin/generate-key', [RegistrationKeyController::class, 'generate']);
});
