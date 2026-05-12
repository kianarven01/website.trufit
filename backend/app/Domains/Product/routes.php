<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Product\Http\Controllers\ProductController;
use App\Domains\Product\Http\Controllers\ProductReferenceController;
use App\Domains\Product\Http\Controllers\ProductEquivalentController;
use App\Domains\Supplier\Http\Controllers\SupplierController;
use App\Domains\Product\Domain\Repositories\ProductRepositoryInterface;
use App\Domains\Product\Infrastructure\Repositories\EloquentProductRepository;

app()->bind(
    ProductRepositoryInterface::class,
    EloquentProductRepository::class
);

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

    Route::get('/{productId}/equivalents', [ProductEquivalentController::class, 'index']);
    Route::post('/{productId}/equivalents', [ProductEquivalentController::class, 'store']);
    Route::delete('/{productId}/equivalents/{equivalentProductId}', [ProductEquivalentController::class, 'destroy']);

    Route::get('/{id}', [ProductController::class, 'show']);
});