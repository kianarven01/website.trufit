<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Inventory\Http\Controllers\InventoryController;

Route::prefix('inventory')->group(function () {
    Route::get('/', [InventoryController::class, 'index']);
    Route::get('/sundries-movements', [InventoryController::class, 'sundriesMovements']);
    Route::get('/{id}', [InventoryController::class, 'show']);
    Route::post('/adjust-stock', [InventoryController::class, 'adjustStock']);
    Route::post('/deduct-sundries', [InventoryController::class, 'deductSundries']);
});