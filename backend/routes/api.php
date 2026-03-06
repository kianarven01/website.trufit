<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Domains\Auth\Http\Resources\UserResource;

Route::prefix('auth')->group(function () {
    // 1. Load the Domain routes (Login, Register, etc.)
    require app_path('Domains/Auth/routes.php');

    // 2. The Verify Route (Protected by Sanctum)
    Route::middleware('auth:sanctum')->get('/verify', function (Request $request) {
    $user = $request->user();
    
    return response()->json([
        'status' => 'success',
        'data' => [
            'user' => [
                'username' => $user->username,
                'employeeID' => $user->employee_id,
                'name' => $user->employee->first_name ?? $user->username,
                'role' => $user->employee->role->name ?? 'User', // ADD THIS
                'permissions' => [
                    'all' => $user->employee->role->name === 'Admin' // Or your permission logic
                ]
            ]
        ]
    ]);
    });
});