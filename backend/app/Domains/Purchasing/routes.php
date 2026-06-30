<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Purchasing\Http\Controllers\PurchaseOrderController;
use App\Domains\Purchasing\Http\Controllers\GoodsReceiptController;
use App\Domains\Purchasing\Http\Controllers\StockMovementController;

Route::prefix('purchasing')->group(function () {
    Route::get('/purchase-orders', [PurchaseOrderController::class, 'index']);
    Route::post('/purchase-orders', [PurchaseOrderController::class, 'store']);
    Route::get('/purchase-orders/{id}', [PurchaseOrderController::class, 'show']);
    Route::post('/purchase-orders/{id}/submit', [PurchaseOrderController::class, 'submit']);
    Route::post('/purchase-orders/{id}/approve', [PurchaseOrderController::class, 'approve']);
    Route::post('/purchase-orders/{id}/cancel', [PurchaseOrderController::class, 'cancel']);

    Route::get('/goods-receipts', [GoodsReceiptController::class, 'index']);
    Route::post('/goods-receipts', [GoodsReceiptController::class, 'store']);
    Route::get('/goods-receipts/{id}', [GoodsReceiptController::class, 'show']);
    Route::post('/goods-receipts/{id}/approve', [GoodsReceiptController::class, 'approve']);

    Route::get('/stock-movements', [StockMovementController::class, 'index']);
    Route::get('/stock-movements/{id}', [StockMovementController::class, 'show']);
});
