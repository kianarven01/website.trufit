<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Auth\Http\Controllers\LoginController;
use App\Domains\Auth\Http\Controllers\ProfileController;


// for login and auth
Route::post('/login', LoginController::class);

Route::middleware('auth:sanctum')->group(function () {
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/change-password', [ProfileController::class, 'changePassword']);
    Route::put('/email', [ProfileController::class, 'updateEmail']);
    Route::post('/email/resend', [ProfileController::class, 'resendVerificationCode']);
    Route::post('/email/verify', [ProfileController::class, 'verifyEmail']);
    Route::post('/phone/resend', [ProfileController::class, 'resendPhoneVerificationCode']);
    Route::post('/phone/verify', [ProfileController::class, 'verifyPhone']);
});



