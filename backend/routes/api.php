<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\RegistrationKeyController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RoleController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/verify-registration-key', [RegistrationKeyController::class, 'verify']);
Route::post('/register', [AuthController::class, 'register']);


//for admin role management CRUD
Route::get('/admin/roles', [RoleController::class, 'index']);
Route::post('/admin/roles', [RoleController::class, 'store']);
Route::put('/admin/roles/{id}', [RoleController::class, 'update']);
Route::delete('/admin/roles/{id}', [RoleController::class, 'destroy']);

Route::prefix('admin')->group(function () {

    Route::get('/roles', [RegistrationKeyController::class, 'getRoles']);
    Route::get('/roles', [RoleController::class, 'index']);
    Route::post('/roles', [RoleController::class, 'store']);
});

Route::middleware('auth:sanctum')->group(function () {
    //for admin
    Route::post('/admin/generate-key', [RegistrationKeyController::class, 'generate'])->middleware('permission:admin_panel,write');

    /*Route::post('/inventory', [InventoryController::class, 'store'])
        ->middleware('permission:inventory,write');*/
});
