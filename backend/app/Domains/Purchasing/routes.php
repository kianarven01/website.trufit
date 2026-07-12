<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Purchasing\Http\Controllers\PurchaseOrderController;
use App\Domains\Purchasing\Http\Controllers\GoodsReceiptController;
use App\Domains\Purchasing\Http\Controllers\StockMovementController;
use App\Domains\Purchasing\Http\Controllers\SupplierBillController;

Route::prefix('purchasing')->group(function () {
    Route::get('/purchase-orders', [PurchaseOrderController::class, 'index']);
    Route::post('/purchase-orders', [PurchaseOrderController::class, 'store']);

    Route::post('/purchase-orders/{id}/submit', [PurchaseOrderController::class, 'submit']);
    Route::post('/purchase-orders/{id}/approve', [PurchaseOrderController::class, 'approve']);
    Route::post('/purchase-orders/{id}/cancel', [PurchaseOrderController::class, 'cancel']);
    Route::post('/purchase-orders/{id}/close', [PurchaseOrderController::class, 'close']);
    Route::post('/purchase-orders/{id}/reopen', [PurchaseOrderController::class, 'reopen']);
    Route::put('/purchase-orders/{id}', [PurchaseOrderController::class, 'update']);
    Route::delete('/purchase-orders/{id}', [PurchaseOrderController::class, 'destroy']);
    Route::patch('/purchase-orders/{id}/restore', [PurchaseOrderController::class, 'restore']);
    Route::delete('/purchase-orders/{id}/force', [PurchaseOrderController::class, 'forceDelete']);
    Route::get('/purchase-orders/{id}/download-pdf', [PurchaseOrderController::class, 'downloadPdf']);
    Route::get('/purchase-orders/{id}', [PurchaseOrderController::class, 'show']);

    Route::get('/goods-receipts', [GoodsReceiptController::class, 'index']);
    Route::post('/goods-receipts', [GoodsReceiptController::class, 'store']);
    Route::put('/goods-receipts/{id}', [GoodsReceiptController::class, 'update']);
    Route::post('/goods-receipts/{id}/receive', [GoodsReceiptController::class, 'receive']);
    Route::post('/goods-receipts/{id}/approve', [GoodsReceiptController::class, 'approve']);
    Route::post('/goods-receipts/{id}/cancel', [GoodsReceiptController::class, 'cancel']);
    Route::post('/goods-receipts/{id}/return/request', [GoodsReceiptController::class, 'requestReturn']);
    Route::post('/goods-receipts/{id}/return/approve', [GoodsReceiptController::class, 'approveReturn']);
    Route::post('/goods-receipts/{id}/return/reject', [GoodsReceiptController::class, 'rejectReturn']);
    Route::delete('/goods-receipts/{id}', [GoodsReceiptController::class, 'destroy']);
    Route::patch('/goods-receipts/{id}/restore', [GoodsReceiptController::class, 'restore']);
    Route::delete('/goods-receipts/{id}/force', [GoodsReceiptController::class, 'forceDelete']);
    Route::get('/goods-receipts/{id}/download-pdf', [GoodsReceiptController::class, 'downloadPdf']);
    Route::get('/goods-receipts/{id}', [GoodsReceiptController::class, 'show']);

    Route::get('/supplier-bills', [SupplierBillController::class, 'index']);
    Route::post('/supplier-bills', [SupplierBillController::class, 'store']);
    Route::get('/supplier-bills/{id}/download-pdf', [SupplierBillController::class, 'downloadPdf']);
    Route::get('/supplier-bills/{id}', [SupplierBillController::class, 'show']);
    Route::post('/supplier-bills/{id}/approve', [SupplierBillController::class, 'approve']);
    Route::post('/supplier-bills/{id}/pay', [SupplierBillController::class, 'pay']);
    Route::post('/supplier-bills/{id}/void', [SupplierBillController::class, 'void']);
    Route::delete('/supplier-bills/{id}', [SupplierBillController::class, 'destroy']);
    Route::patch('/supplier-bills/{id}/restore', [SupplierBillController::class, 'restore']);
    Route::delete('/supplier-bills/{id}/force', [SupplierBillController::class, 'forceDelete']);

    Route::get('/stock-movements', [StockMovementController::class, 'index']);
});
