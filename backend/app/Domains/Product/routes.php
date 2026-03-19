<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Product\Http\Controllers\ProductController;
use App\Domains\Product\Http\Controllers\ProductReferenceController;
use App\Domains\Supplier\Http\Controllers\SupplierController;

Route::prefix('products')->group(function () {
    Route::get('/', [ProductController::class, 'index']);
    Route::get('/categories', [ProductReferenceController::class, 'categories']);
    Route::get('/units', [ProductReferenceController::class, 'units']);
    Route::get('/suppliers', [SupplierController::class, 'index']);
});
