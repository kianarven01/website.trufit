<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Employee\Http\Controllers\EmployeeController;
use App\Domains\Auth\Http\Controllers\AuthController;

// 1. Auth Group (Prefix: /api/auth)
Route::prefix('auth')->group(function () {
    // Load the Domain routes (Login, Register, etc.)
    require app_path('Domains/Auth/routes.php');

    // The Verify Route (Protected by Sanctum)
    Route::middleware('auth:sanctum')->get('/verify', [AuthController::class, 'verify']);
}); // <--- Make sure this closing brace is HERE

// 2. Admin/Employee Group (Prefix: /api)
// Moving this OUTSIDE the auth group makes the URL /api/admin/employees
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/admin/employees', [EmployeeController::class, 'index']);
});