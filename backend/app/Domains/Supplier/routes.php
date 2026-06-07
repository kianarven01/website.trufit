<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Supplier\Http\Controllers\SupplierController;

Route::prefix('suppliers')->group(function () {
    Route::get('/', [SupplierController::class, 'index']);
    Route::post('/', [SupplierController::class, 'store']);
    Route::get('/{id}', [SupplierController::class, 'show']);
    Route::put('/{id}', [SupplierController::class, 'update']);
    Route::delete('/{id}', [SupplierController::class, 'destroy']);

    Route::post('/{id}/products', [SupplierController::class, 'linkProduct']);
    Route::delete('/{id}/products/{productId}', [SupplierController::class, 'unlinkProduct']);
    Route::put('/{id}/products/{productId}', [SupplierController::class, 'updateProductCost']);
});