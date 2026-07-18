<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Billing\Http\Controllers\BillingController;

Route::prefix('billing-statements')->group(function () {
    Route::get('/', [BillingController::class, 'index']);
    Route::post('/', [BillingController::class, 'store']);
    Route::get('/{id}/pdf', [BillingController::class, 'downloadPdf']);
    Route::get('/{id}', [BillingController::class, 'show']);
    Route::post('/{id}/payments', [BillingController::class, 'addPayment']);
    Route::patch('/{id}/discount', [BillingController::class, 'updateDiscount']);
    Route::patch('/{id}/notes', [BillingController::class, 'updateNotes']);
    Route::patch('/{id}/restore', [BillingController::class, 'restore']);
    Route::delete('/{id}/force', [BillingController::class, 'forceDelete']);
    Route::delete('/{id}', [BillingController::class, 'destroy']);
});
