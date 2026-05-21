
<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Employee\Http\Controllers\EmployeeController;


// All routes here are already protected by sanctum via the main api.php loader
Route::get('/admin/employees', [EmployeeController::class, 'index']);
Route::put('/admin/employees/{id}', [EmployeeController::class, 'update']);
Route::delete('/admin/employees/{id}', [EmployeeController::class, 'terminate']);
Route::get('/admin/registration-keys', [EmployeeController::class, 'onboarding']);
Route::get('/admin/roles', [EmployeeController::class, 'getRoles']);
