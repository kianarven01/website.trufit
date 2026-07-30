<?php

use Illuminate\Support\Facades\Route;
use App\Domains\SalesOrder\Http\Controllers\SalesOrderController;

Route::prefix('sales-orders')->group(function () {
    // View routes
    Route::get('/', [SalesOrderController::class, 'index'])->middleware('check.permission:sales.view,sales.manage');
    Route::get('/{id}', [SalesOrderController::class, 'show'])->middleware('check.permission:sales.view,sales.manage');
    Route::get('/{id}/pdf', [SalesOrderController::class, 'downloadPdf'])->middleware('check.permission:sales.view,sales.manage');
    Route::get('/{id}/estimate-items', [SalesOrderController::class, 'estimateItems'])->middleware('check.permission:sales.view,sales.manage');

    // Manage routes
    Route::post('/', [SalesOrderController::class, 'store'])->middleware('permission:sales.manage');
    Route::put('/{id}', [SalesOrderController::class, 'update'])->middleware('permission:sales.manage');
    Route::patch('/{id}', [SalesOrderController::class, 'update'])->middleware('permission:sales.manage');
    Route::delete('/{id}', [SalesOrderController::class, 'destroy'])->middleware('permission:sales.manage');
    Route::patch('/{id}/restore', [SalesOrderController::class, 'restore'])->middleware('permission:sales.manage');
    Route::delete('/{id}/force', [SalesOrderController::class, 'forceDelete'])->middleware('permission:sales.manage');

    // Workflow routes
    Route::post('/{id}/submit', [SalesOrderController::class, 'submit'])->middleware('permission:sales.manage');
    Route::post('/{id}/approve', [SalesOrderController::class, 'approve'])->middleware('permission:sales.manage');
    Route::post('/{id}/start-work', [SalesOrderController::class, 'startWork'])->middleware('permission:sales.manage');
    Route::post('/{id}/complete', [SalesOrderController::class, 'complete'])->middleware('permission:sales.manage');
    Route::post('/{id}/reopen', [SalesOrderController::class, 'reopen'])->middleware('permission:sales.manage');
    Route::post('/{id}/cancel', [SalesOrderController::class, 'cancel'])->middleware('permission:sales.manage');
    Route::post('/{id}/void', [SalesOrderController::class, 'void'])->middleware('permission:sales.manage');
    Route::post('/{id}/issue', [SalesOrderController::class, 'issue'])->middleware('permission:sales.manage');
    Route::post('/{id}/return', [SalesOrderController::class, 'returnItems'])->middleware('permission:sales.manage');
    Route::post('/{id}/add-items', [SalesOrderController::class, 'addItems'])->middleware('permission:sales.manage');
    Route::post('/{id}/items/{itemId}/link', [SalesOrderController::class, 'linkCustomItem'])->middleware('permission:sales.manage');
    Route::post('/{id}/items/{itemId}/unlink', [SalesOrderController::class, 'unlinkCustomItem'])->middleware('permission:sales.manage');
});
