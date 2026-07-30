<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Product\Http\Controllers\ProductController;
use App\Domains\Product\Http\Controllers\ProductReferenceController;
use App\Domains\Product\Http\Controllers\ProductEquivalentGroupController;
use App\Domains\Product\Http\Controllers\ProductSkuController;
use App\Domains\Product\Http\Controllers\ProductSupplierController;
use App\Domains\Product\Http\Controllers\ProductVehicleCompatibilityController;
use App\Domains\Supplier\Http\Controllers\SupplierController;

Route::prefix('products')->group(function () {
    // Product CRUD - list and create
    Route::get('/', [ProductController::class, 'index'])->middleware('check.permission:products.view,products.manage');
    Route::post('/', [ProductController::class, 'store'])->middleware('permission:products.manage');

    // Reference data - Categories
    Route::get('/categories', [ProductReferenceController::class, 'categories'])->middleware('check.permission:products.view,products.manage');
    Route::post('/categories', [ProductReferenceController::class, 'storeCategory'])->middleware('permission:products.manage');
    Route::put('/categories/{id}', [ProductReferenceController::class, 'updateCategory'])->middleware('permission:products.manage');
    Route::delete('/categories/{id}', [ProductReferenceController::class, 'deleteCategory'])->middleware('permission:products.manage');

    // Reference data - Service Categories (Service Catalog)
    Route::get('/service-categories', [ProductReferenceController::class, 'serviceCategories'])->middleware('check.permission:services.view_job_orders,services.manage_catalog');
    Route::post('/service-categories', [ProductReferenceController::class, 'storeServiceCategory'])->middleware('permission:services.manage_catalog');
    Route::put('/service-categories/{id}', [ProductReferenceController::class, 'updateServiceCategory'])->middleware('permission:services.manage_catalog');
    Route::delete('/service-categories/{id}', [ProductReferenceController::class, 'deleteServiceCategory'])->middleware('permission:services.manage_catalog');

    // Reference data - Units
    Route::get('/units', [ProductReferenceController::class, 'units'])->middleware('check.permission:products.view,products.manage');
    Route::post('/units', [ProductReferenceController::class, 'storeUnit'])->middleware('permission:products.manage');
    Route::put('/units/{id}', [ProductReferenceController::class, 'updateUnit'])->middleware('permission:products.manage');
    Route::delete('/units/{id}', [ProductReferenceController::class, 'deleteUnit'])->middleware('permission:products.manage');

    // Reference data - Manufacturers
    Route::get('/manufacturers', [ProductReferenceController::class, 'manufacturers'])->middleware('check.permission:products.view,products.manage');
    Route::post('/manufacturers', [ProductReferenceController::class, 'storeManufacturer'])->middleware('permission:products.manage');
    Route::put('/manufacturers/{id}', [ProductReferenceController::class, 'updateManufacturer'])->middleware('permission:products.manage');
    Route::delete('/manufacturers/{id}', [ProductReferenceController::class, 'deleteManufacturer'])->middleware('permission:products.manage');

    // Reference data - Parts
    Route::get('/parts', [ProductController::class, 'parts'])->middleware('check.permission:products.view,products.manage');
    Route::post('/parts', [ProductReferenceController::class, 'storePart'])->middleware('permission:products.manage');
    Route::put('/parts/{id}', [ProductReferenceController::class, 'updatePart'])->middleware('permission:products.manage');
    Route::delete('/parts/{id}', [ProductReferenceController::class, 'deletePart'])->middleware('permission:products.manage');

    // Reference data - Vehicles
    Route::get('/vehicles', [ProductReferenceController::class, 'vehicles'])->middleware('check.permission:products.view,products.manage');
    Route::post('/vehicles/custom', [ProductReferenceController::class, 'storeCustomVehicle'])->middleware('permission:products.manage');

    // SKU Preview
    Route::get('/sku-preview', [ProductSkuController::class, 'preview'])->middleware('check.permission:products.view,products.manage');

    // Service Types (Service Catalog)
    Route::get('/service-types', [ProductReferenceController::class, 'serviceTypes'])->middleware('check.permission:services.view_job_orders,services.manage_catalog');
    Route::get('/service-types/{id}', [ProductReferenceController::class, 'showServiceType'])->middleware('check.permission:services.view_job_orders,services.manage_catalog');
    Route::post('/service-types', [ProductReferenceController::class, 'storeServiceType'])->middleware('permission:services.manage_catalog');
    Route::put('/service-types/{id}', [ProductReferenceController::class, 'updateServiceType'])->middleware('permission:services.manage_catalog');
    Route::delete('/service-types/{id}', [ProductReferenceController::class, 'destroyServiceType'])->middleware('permission:services.manage_catalog');

    // Supplier routes used by Product screens
    Route::get('/suppliers', [SupplierController::class, 'index'])->middleware('check.permission:purchasing.view,purchasing.manage');

    // Equivalent group routes (non-UUID paths first)
    Route::post('/equivalent-groups/{groupId}/items', [ProductEquivalentGroupController::class, 'addItem'])->middleware('permission:products.manage');
    Route::delete('/equivalent-groups/{groupId}/items/{productId}', [ProductEquivalentGroupController::class, 'removeItem'])->middleware('permission:products.manage');

    // Product by UUID - MUST be after all specific routes
    Route::get('/{id}', [ProductController::class, 'show'])->middleware('check.permission:products.view,products.manage');
    Route::patch('/{id}', [ProductController::class, 'update'])->middleware('permission:products.manage');
    Route::put('/{id}', [ProductController::class, 'update'])->middleware('permission:products.manage');
    Route::delete('/{id}', [ProductController::class, 'archive'])->middleware('permission:products.manage');
    Route::delete('/{id}/force', [ProductController::class, 'forceDelete'])->middleware('permission:products.manage');
    Route::patch('/{id}/restore', [ProductController::class, 'restore'])->middleware('permission:products.manage');

    // Product sub-routes (must be after /{id})
    Route::post('/{productId}/suppliers', [ProductSupplierController::class, 'store'])->middleware('permission:products.manage');
    Route::put('/{productId}/suppliers/{productSupplierId}', [ProductSupplierController::class, 'update'])->middleware('permission:products.manage');
    Route::delete('/{productId}/suppliers/{productSupplierId}', [ProductSupplierController::class, 'destroy'])->middleware('permission:products.manage');
    Route::get('/{productId}/equivalent-groups', [ProductEquivalentGroupController::class, 'index'])->middleware('check.permission:products.view,products.manage');
    Route::get('/{productId}/equivalent-candidates', [ProductEquivalentGroupController::class, 'candidates'])->middleware('check.permission:products.view,products.manage');
    Route::post('/{productId}/equivalent-groups', [ProductEquivalentGroupController::class, 'store'])->middleware('permission:products.manage');
    Route::post('/{productId}/vehicle-compatibilities', [ProductVehicleCompatibilityController::class, 'store'])->middleware('permission:products.manage');
    Route::post('/{productId}/vehicle-compatibilities/sync-equivalents', [ProductVehicleCompatibilityController::class, 'syncToEquivalents'])->middleware('permission:products.manage');
    Route::delete('/{productId}/vehicle-compatibilities/{compatibilityId}', [ProductVehicleCompatibilityController::class, 'destroy'])->middleware('permission:products.manage');
});
