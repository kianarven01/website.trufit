<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Audit\Http\Controllers\AuditController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/admin/audit-logs', [AuditController::class, 'index']);
});