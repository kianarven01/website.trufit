<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Estimate\Http\Controllers\EstimateController;

Route::prefix('estimates')->group(function () {
    Route::get('/', [EstimateController::class, 'index'])->middleware('check.permission:sales.view,sales.manage');
    Route::get('/{id}', [EstimateController::class, 'show'])->middleware('check.permission:sales.view,sales.manage');
    Route::get('/{id}/download-pdf', [EstimateController::class, 'downloadPdf'])->middleware('check.permission:sales.view,sales.manage');
    Route::post('/', [EstimateController::class, 'store'])->middleware('permission:sales.manage');
    Route::put('/{id}', [EstimateController::class, 'update'])->middleware('permission:sales.manage');
    Route::delete('/{id}', [EstimateController::class, 'destroy'])->middleware('permission:sales.manage');
    Route::patch('/{id}/restore', [EstimateController::class, 'restore'])->middleware('permission:sales.manage');
    Route::delete('/{id}/force', [EstimateController::class, 'forceDelete'])->middleware('permission:sales.manage');
});
