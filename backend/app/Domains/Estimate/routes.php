<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Estimate\Http\Controllers\EstimateController;

Route::prefix('estimates')->group(function () {
    Route::get('/', [EstimateController::class, 'index']);
    Route::post('/', [EstimateController::class, 'store']);
    Route::get('/{id}', [EstimateController::class, 'show']);
    Route::put('/{id}', [EstimateController::class, 'update']);
    Route::delete('/{id}', [EstimateController::class, 'destroy']);
    Route::get('/{id}/download-pdf', [EstimateController::class, 'downloadPdf']);
});
