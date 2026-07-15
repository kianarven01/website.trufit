<?php

use Illuminate\Support\Facades\Route;
use App\Domains\SalesOrder\Http\Controllers\SalesOrderController;

Route::prefix('sales-orders')->group(function () {
    Route::get('/', [SalesOrderController::class, 'index']);
    Route::post('/', [SalesOrderController::class, 'store']);

    Route::post('/{id}/submit', [SalesOrderController::class, 'submit']);
    Route::post('/{id}/approve', [SalesOrderController::class, 'approve']);
    Route::post('/{id}/start-work', [SalesOrderController::class, 'startWork']);
    Route::post('/{id}/close', [SalesOrderController::class, 'close']);
    Route::post('/{id}/reopen', [SalesOrderController::class, 'reopen']);
    Route::post('/{id}/cancel', [SalesOrderController::class, 'cancel']);
    Route::patch('/{id}/restore', [SalesOrderController::class, 'restore']);
    Route::delete('/{id}/force', [SalesOrderController::class, 'forceDelete']);

    Route::get('/{id}/pdf', [SalesOrderController::class, 'downloadPdf']);

    Route::get('/{id}', [SalesOrderController::class, 'show']);
    Route::put('/{id}', [SalesOrderController::class, 'update']);
    Route::patch('/{id}', [SalesOrderController::class, 'update']);
    Route::delete('/{id}', [SalesOrderController::class, 'destroy']);
});
