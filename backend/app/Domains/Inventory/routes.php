<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Inventory\Http\Controllers\InventoryController;
use App\Domains\Inventory\Http\Controllers\WarehouseController;
use App\Domains\Inventory\Http\Controllers\BinLocationController;

Route::prefix('inventory')->group(function () {
    Route::get('/', [InventoryController::class, 'index'])->middleware('check.permission:products.view,products.manage');
    Route::get('/sundries-movements', [InventoryController::class, 'sundriesMovements'])->middleware('check.permission:products.view,products.manage');
    Route::get('/{id}', [InventoryController::class, 'show'])->middleware('check.permission:products.view,products.manage');
    Route::post('/adjust-stock', [InventoryController::class, 'adjustStock'])->middleware('permission:products.manage');
    Route::post('/deduct-sundries', [InventoryController::class, 'deductSundries'])->middleware('permission:products.manage');
    Route::post('/sundries-movements/{id}/reverse', [InventoryController::class, 'reverseSundries'])->middleware('permission:products.manage');
    Route::put('/{id}/location', [InventoryController::class, 'updateLocation'])->middleware('permission:products.manage');
});

Route::prefix('warehouses')->group(function () {
    Route::get('/', [WarehouseController::class, 'index'])->middleware('check.permission:products.view,products.manage');
    Route::post('/', [WarehouseController::class, 'store'])->middleware('permission:products.manage');
    Route::put('/{id}', [WarehouseController::class, 'update'])->middleware('permission:products.manage');
    Route::delete('/{id}', [WarehouseController::class, 'destroy'])->middleware('permission:products.manage');

    Route::prefix('/{warehouseId}/bins')->group(function () {
        Route::get('/', [BinLocationController::class, 'index'])->middleware('check.permission:products.view,products.manage');
        Route::post('/', [BinLocationController::class, 'store'])->middleware('permission:products.manage');
    });
});

Route::prefix('bin-locations')->group(function () {
    Route::put('/{id}', [BinLocationController::class, 'update'])->middleware('permission:products.manage');
    Route::delete('/{id}', [BinLocationController::class, 'destroy'])->middleware('permission:products.manage');
});
