<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Auth\Http\Controllers\LoginController;
use App\Domains\Auth\Http\Controllers\ProfileController;
use App\Domains\Auth\Http\Controllers\AuthController;


// for login and auth
Route::post('/login', LoginController::class)->middleware('throttle:auth');
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:auth');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:auth');

Route::middleware('auth:sanctum')->group(function () {
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/change-password', [ProfileController::class, 'changePassword'])->middleware('throttle:auth');
    Route::put('/email', [ProfileController::class, 'updateEmail']);
    Route::post('/email/resend', [ProfileController::class, 'resendVerificationCode'])->middleware('throttle:verification');
    Route::post('/email/verify', [ProfileController::class, 'verifyEmail']);
    Route::post('/phone/resend', [ProfileController::class, 'resendPhoneVerificationCode'])->middleware('throttle:verification');
    Route::post('/phone/verify', [ProfileController::class, 'verifyPhone']);
});



