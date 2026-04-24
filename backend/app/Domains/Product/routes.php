<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Product\Http\Controllers\ProductController;
use App\Domains\Product\Http\Controllers\ProductReferenceController;

Route::prefix('products')->group(function () {
    Route::get('/', [ProductController::class, 'index']);
    Route::post('/', [ProductController::class, 'store']);

    Route::get('/categories', [ProductReferenceController::class, 'categories']);
    Route::get('/units', [ProductReferenceController::class, 'units']);
    Route::get('/manufacturers', [ProductReferenceController::class, 'manufacturers']);
});