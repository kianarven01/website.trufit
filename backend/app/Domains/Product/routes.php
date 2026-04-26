<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Product\Http\Controllers\ProductController;
use App\Domains\Product\Http\Controllers\ProductReferenceController;
use App\Domains\Supplier\Http\Controllers\SupplierController;

Route::prefix('products')->group(function () {
    Route::get('/', [ProductController::class, 'index']);
    Route::post('/', [ProductController::class, 'store']);

    Route::get('/categories', [ProductReferenceController::class, 'categories']);
    Route::post('/categories', [ProductReferenceController::class, 'storeCategory']);
    Route::put('/categories/{id}', [ProductReferenceController::class, 'updateCategory']);
    Route::delete('/categories/{id}', [ProductReferenceController::class, 'deleteCategory']);

    Route::get('/units', [ProductReferenceController::class, 'units']);
    Route::get('/manufacturers', [ProductReferenceController::class, 'manufacturers']);

    Route::get('/suppliers', [SupplierController::class, 'index']);

    Route::get('/{id}', [ProductController::class, 'show']);
});