<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Inventory\Http\Controllers\InventoryController;
use App\Domains\Inventory\Http\Controllers\WarehouseController;
use App\Domains\Inventory\Http\Controllers\BinLocationController;

Route::prefix('inventory')->group(function () {
    Route::get('/', [InventoryController::class, 'index']);
    Route::get('/sundries-movements', [InventoryController::class, 'sundriesMovements']);
    Route::post('/sundries-movements/{id}/reverse', [InventoryController::class, 'reverseSundries']);
    Route::get('/{id}', [InventoryController::class, 'show']);
    Route::put('/{id}/location', [InventoryController::class, 'updateLocation']);
    Route::post('/adjust-stock', [InventoryController::class, 'adjustStock']);
    Route::post('/deduct-sundries', [InventoryController::class, 'deductSundries']);
});

Route::prefix('warehouses')->group(function () {
    Route::get('/', [WarehouseController::class, 'index']);
    Route::post('/', [WarehouseController::class, 'store']);
    Route::put('/{id}', [WarehouseController::class, 'update']);
    Route::delete('/{id}', [WarehouseController::class, 'destroy']);

    Route::prefix('/{warehouseId}/bins')->group(function () {
        Route::get('/', [BinLocationController::class, 'index']);
        Route::post('/', [BinLocationController::class, 'store']);
    });
});

Route::prefix('bin-locations')->group(function () {
    Route::put('/{id}', [BinLocationController::class, 'update']);
    Route::delete('/{id}', [BinLocationController::class, 'destroy']);
});