<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Supplier\Http\Controllers\SupplierController;

Route::prefix('suppliers')->group(function () {
    Route::get('/', [SupplierController::class, 'index'])->middleware('check.permission:purchasing.view,purchasing.manage');
    Route::get('/{id}', [SupplierController::class, 'show'])->middleware('check.permission:purchasing.view,purchasing.manage');
    Route::post('/', [SupplierController::class, 'store'])->middleware('permission:purchasing.manage');
    Route::put('/{id}', [SupplierController::class, 'update'])->middleware('permission:purchasing.manage');
    Route::delete('/{id}', [SupplierController::class, 'destroy'])->middleware('permission:purchasing.manage');

    Route::post('/{id}/products', [SupplierController::class, 'linkProduct'])->middleware('permission:purchasing.manage');
    Route::delete('/{id}/products/{productId}', [SupplierController::class, 'unlinkProduct'])->middleware('permission:purchasing.manage');
    Route::put('/{id}/products/{productId}', [SupplierController::class, 'updateProductCost'])->middleware('permission:purchasing.manage');
});
