<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Role\Http\Controllers\RoleController;

Route::get('/admin/roles', [RoleController::class, 'index'])
    ->middleware('check.permission:system.manage_employees,system.manage_roles');
Route::get('/admin/roles/permissions', [RoleController::class, 'getAvailablePermissions'])
    ->middleware('check.permission:system.manage_employees,system.manage_roles');
Route::get('/admin/roles/{id}', [RoleController::class, 'show'])
    ->middleware('check.permission:system.manage_employees,system.manage_roles');
Route::post('/admin/roles', [RoleController::class, 'store'])
    ->middleware('permission:system.manage_roles');
Route::put('/admin/roles/{id}', [RoleController::class, 'update'])
    ->middleware('permission:system.manage_roles');
Route::delete('/admin/roles/{id}', [RoleController::class, 'destroy'])
    ->middleware('permission:system.manage_roles');
