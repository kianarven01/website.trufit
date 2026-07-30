<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Billing\Http\Controllers\BillingController;

Route::prefix('billing-statements')->group(function () {
    // View routes
    Route::get('/', [BillingController::class, 'index'])->middleware('check.permission:sales.view,sales.manage');
    Route::get('/{id}', [BillingController::class, 'show'])->middleware('check.permission:sales.view,sales.manage');
    Route::get('/{id}/pdf', [BillingController::class, 'downloadPdf'])->middleware('check.permission:sales.view,sales.manage');

    // Manage routes
    Route::post('/', [BillingController::class, 'store'])->middleware('permission:sales.manage');
    Route::post('/{id}/payments', [BillingController::class, 'addPayment'])->middleware('permission:sales.manage');
    Route::patch('/{id}/discount', [BillingController::class, 'updateDiscount'])->middleware('permission:sales.manage');
    Route::patch('/{id}/notes', [BillingController::class, 'updateNotes'])->middleware('permission:sales.manage');
    Route::patch('/{id}/restore', [BillingController::class, 'restore'])->middleware('permission:sales.manage');
    Route::delete('/{id}/force', [BillingController::class, 'forceDelete'])->middleware('permission:sales.manage');
    Route::delete('/{id}', [BillingController::class, 'destroy'])->middleware('permission:sales.manage');
});
