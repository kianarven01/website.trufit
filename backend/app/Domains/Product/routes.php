<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Product\Http\Controllers\ProductController;
use App\Domains\Product\Http\Controllers\ProductReferenceController;
use App\Domains\Product\Http\Controllers\ProductEquivalentGroupController;
use App\Domains\Product\Http\Controllers\ProductSkuController;
use App\Domains\Product\Http\Controllers\ProductStockController;
use App\Domains\Product\Http\Controllers\ProductSupplierController;
use App\Domains\Product\Http\Controllers\ProductVehicleCompatibilityController;
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

    // Reference data routes
    Route::get('/categories', [ProductReferenceController::class, 'categories']);
    Route::post('/categories', [ProductReferenceController::class, 'storeCategory']);
    Route::put('/categories/{id}', [ProductReferenceController::class, 'updateCategory']);
    Route::delete('/categories/{id}', [ProductReferenceController::class, 'deleteCategory']);

    Route::get('/service-categories', [ProductReferenceController::class, 'serviceCategories']);
    Route::post('/service-categories', [ProductReferenceController::class, 'storeServiceCategory']);
    Route::put('/service-categories/{id}', [ProductReferenceController::class, 'updateServiceCategory']);
    Route::delete('/service-categories/{id}', [ProductReferenceController::class, 'deleteServiceCategory']);

    Route::get('/units', [ProductReferenceController::class, 'units']);
    Route::post('/units', [ProductReferenceController::class, 'storeUnit']);

    Route::get('/manufacturers', [ProductReferenceController::class, 'manufacturers']);
    Route::post('/manufacturers', [ProductReferenceController::class, 'storeManufacturer']);

    Route::get('/parts', [ProductController::class, 'parts']);
    Route::post('/parts', [ProductReferenceController::class, 'storePart']);

    Route::get('/vehicles', [ProductReferenceController::class, 'vehicles']);
    Route::post('/vehicles/custom', [ProductReferenceController::class, 'storeCustomVehicle']);

    Route::get('/service-types', [ProductReferenceController::class, 'serviceTypes']);
    Route::get('/service-types/{id}', [ProductReferenceController::class, 'showServiceType']);
    Route::post('/service-types', [ProductReferenceController::class, 'storeServiceType']);
    Route::put('/service-types/{id}', [ProductReferenceController::class, 'updateServiceType']);
    Route::delete('/service-types/{id}', [ProductReferenceController::class, 'destroyServiceType']);

    // Supplier routes used by Product screens
    Route::get('/suppliers', [SupplierController::class, 'index']);
    Route::post('/{productId}/suppliers', [ProductSupplierController::class, 'store']);

    // Equivalent group routes
    Route::get('/{productId}/equivalent-groups', [ProductEquivalentGroupController::class, 'index']);
    Route::get('/{productId}/equivalent-candidates', [ProductEquivalentGroupController::class, 'candidates']);
    Route::post('/{productId}/equivalent-groups', [ProductEquivalentGroupController::class, 'store']);
    Route::post('/equivalent-groups/{groupId}/items', [ProductEquivalentGroupController::class, 'addItem']);
    Route::delete('/equivalent-groups/{groupId}/items/{productId}', [ProductEquivalentGroupController::class, 'removeItem']);

    // Vehicle compatibility routes
    Route::post('/{productId}/vehicle-compatibilities', [ProductVehicleCompatibilityController::class, 'store']);
    Route::post('/{productId}/vehicle-compatibilities/sync-equivalents', [ProductVehicleCompatibilityController::class, 'syncToEquivalents']);

    // SKU preview route
    Route::get('/sku-preview', [ProductSkuController::class, 'preview']);

    // Stock adjustment route
    Route::post('/{id}/adjust-stock', [ProductStockController::class, 'adjust']);

    // Product archive route
    Route::delete('/{id}', [ProductController::class, 'archive']);

    // Product details route. Keep this last so it does not catch static routes above.
    Route::get('/{id}', [ProductController::class, 'show']);
});
