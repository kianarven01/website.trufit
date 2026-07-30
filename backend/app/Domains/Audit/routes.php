<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Audit\Http\Controllers\AuditController;

Route::get('/admin/audit-logs', [AuditController::class, 'index'])->middleware('permission:system.manage_employees');
