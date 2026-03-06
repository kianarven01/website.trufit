<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Domains\Auth\Http\Resources\UserResource;
use App\Domains\Auth\Http\Controllers\AuthController;

//for login (LoginController)
Route::prefix('auth')->group(function () {
        // Load the Domain routes (Login, Register, etc.)
        require app_path('Domains/Auth/routes.php');

// The Verify Route (Protected by Sanctum). For token authentication (AuthController)
Route::middleware('auth:sanctum')->get('/verify', [AuthController::class, 'verify']);

});