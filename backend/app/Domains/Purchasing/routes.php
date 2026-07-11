<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Purchasing\Http\Controllers\PurchaseOrderController;
use App\Domains\Purchasing\Http\Controllers\GoodsReceiptController;
use App\Domains\Purchasing\Http\Controllers\StockMovementController;

Route::prefix('purchasing')->group(function () {
    Route::get('/purchase-orders', [PurchaseOrderController::class, 'index']);
    Route::post('/purchase-orders', [PurchaseOrderController::class, 'store']);

    Route::post('/purchase-orders/{id}/submit', [PurchaseOrderController::class, 'submit']);
    Route::post('/purchase-orders/{id}/approve', [PurchaseOrderController::class, 'approve']);
    Route::post('/purchase-orders/{id}/cancel', [PurchaseOrderController::class, 'cancel']);
    Route::post('/purchase-orders/{id}/close', [PurchaseOrderController::class, 'close']);
    Route::put('/purchase-orders/{id}', [PurchaseOrderController::class, 'update']);
    Route::delete('/purchase-orders/{id}', [PurchaseOrderController::class, 'destroy']);
    Route::get('/purchase-orders/{id}', [PurchaseOrderController::class, 'show']);

    Route::get('/goods-receipts', [GoodsReceiptController::class, 'index']);
    Route::post('/goods-receipts', [GoodsReceiptController::class, 'store']);

    Route::post('/goods-receipts/{id}/receive', [GoodsReceiptController::class, 'receive']);
    Route::post('/goods-receipts/{id}/approve', [GoodsReceiptController::class, 'approve']);
    Route::post('/goods-receipts/{id}/cancel', [GoodsReceiptController::class, 'cancel']);
    Route::post('/goods-receipts/{id}/return', [GoodsReceiptController::class, 'returnItems']);
    Route::delete('/goods-receipts/{id}', [GoodsReceiptController::class, 'destroy']);
    Route::get('/goods-receipts/{id}', [GoodsReceiptController::class, 'show']);

    Route::get('/stock-movements', [StockMovementController::class, 'index']);
});
