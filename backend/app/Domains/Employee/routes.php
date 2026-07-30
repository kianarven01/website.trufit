<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Employee\Http\Controllers\EmployeeController;

Route::get('/admin/employees', [EmployeeController::class, 'index'])->middleware('permission:system.manage_employees');
Route::put('/admin/employees/{id}', [EmployeeController::class, 'update'])->middleware('permission:system.manage_employees');
Route::delete('/admin/employees/{id}', [EmployeeController::class, 'terminate'])->middleware('permission:system.manage_employees');
Route::get('/admin/registration-keys', [EmployeeController::class, 'onboarding'])->middleware('permission:system.onboard');

// Role CRUD is handled by the Role domain (Domains/Role/routes.php)
