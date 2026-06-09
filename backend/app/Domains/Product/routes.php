<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Product\Http\Controllers\ProductController;
use App\Domains\Product\Http\Controllers\ProductReferenceController;
use App\Domains\Product\Http\Controllers\ProductEquivalentGroupController;
use App\Domains\Supplier\Http\Controllers\SupplierController;
use App\Domains\Product\Domain\Repositories\ProductRepositoryInterface;
use App\Domains\Product\Infrastructure\Repositories\EloquentProductRepository;


app()->bind(
    ProductRepositoryInterface::class,
    EloquentProductRepository::class
);

Route::prefix('products')->group(function () {
    // Product routes
    Route::get('/', [ProductController::class, 'index']);
    Route::post('/', [ProductController::class, 'store']);
    Route::post('/{id}/adjust-stock', [ProductController::class, 'adjustStock']);

    // Category routes
    Route::get('/categories', [ProductReferenceController::class, 'categories']);
    Route::get('/service-categories', [ProductReferenceController::class, 'serviceCategories']);
    Route::post('/service-categories', [ProductReferenceController::class, 'storeServiceCategory']);
    Route::put('/service-categories/{id}', [ProductReferenceController::class, 'updateServiceCategory']);
    Route::delete('/service-categories/{id}', [ProductReferenceController::class, 'deleteServiceCategory']);
    Route::post('/categories', [ProductReferenceController::class, 'storeCategory']);
    Route::put('/categories/{id}', [ProductReferenceController::class, 'updateCategory']);
    Route::delete('/categories/{id}', [ProductReferenceController::class, 'deleteCategory']);

    // Reference data routes
    Route::get('/units', [ProductReferenceController::class, 'units']);
    Route::post('/units', [ProductReferenceController::class, 'storeUnit']);

    Route::get('/manufacturers', [ProductReferenceController::class, 'manufacturers']);
    Route::post('/manufacturers', [ProductReferenceController::class, 'storeManufacturer']);

    Route::get('/vehicles', [ProductReferenceController::class, 'vehicles']);
    Route::post('/vehicles/custom', [ProductReferenceController::class, 'storeCustomVehicle']);

    // Service types routes
    Route::get('/service-types', [ProductReferenceController::class, 'serviceTypes']);
    Route::get('/service-types/{id}', [ProductReferenceController::class, 'showServiceType']);
    Route::post('/service-types', [ProductReferenceController::class, 'storeServiceType']);
    Route::put('/service-types/{id}', [ProductReferenceController::class, 'updateServiceType']);
    Route::delete('/service-types/{id}', [ProductReferenceController::class, 'destroyServiceType']);

    // Supplier routes
    Route::get('/suppliers', [SupplierController::class, 'index']);
    Route::post('/{product}/suppliers', [ProductController::class, 'addSupplier']);

    
    // Product equivalent group routes
    Route::get('/{productId}/equivalent-groups', [ProductEquivalentGroupController::class, 'index']);
    Route::post('/{productId}/equivalent-groups', [ProductEquivalentGroupController::class, 'store']);
    Route::post('/equivalent-groups/{groupId}/items', [ProductEquivalentGroupController::class, 'addItem']);
    Route::delete('/equivalent-groups/{groupId}/items/{productId}', [ProductEquivalentGroupController::class, 'removeItem']);

    // Parts routes
    Route::get('/parts', [ProductController::class, 'parts']);
    Route::post('/parts', [ProductReferenceController::class, 'storePart']);

    // SKU preview route
    Route::get('/sku-preview', [ProductController::class, 'skuPreview']);

    // Product details route
    Route::get('/{id}', [ProductController::class, 'show']);


});