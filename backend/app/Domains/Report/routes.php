<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Report\Http\Controllers\ReportController;

Route::middleware('auth:sanctum')->prefix('reports')->group(function () {
    Route::get('/sales', [ReportController::class, 'salesSummary']);
    Route::get('/inventory', [ReportController::class, 'inventoryReport']);
    Route::get('/financial', [ReportController::class, 'financialReport']);
});
