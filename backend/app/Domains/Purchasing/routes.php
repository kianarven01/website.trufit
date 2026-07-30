<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Purchasing\Http\Controllers\PurchaseOrderController;
use App\Domains\Purchasing\Http\Controllers\GoodsReceiptController;
use App\Domains\Purchasing\Http\Controllers\StockMovementController;
use App\Domains\Purchasing\Http\Controllers\SupplierBillController;

Route::prefix('purchasing')->group(function () {
    // Purchase Orders
    Route::get('/purchase-orders', [PurchaseOrderController::class, 'index'])->middleware('check.permission:purchasing.view,purchasing.manage');
    Route::get('/purchase-orders/{id}', [PurchaseOrderController::class, 'show'])->middleware('check.permission:purchasing.view,purchasing.manage');
    Route::get('/purchase-orders/{id}/download-pdf', [PurchaseOrderController::class, 'downloadPdf'])->middleware('check.permission:purchasing.view,purchasing.manage');
    Route::post('/purchase-orders', [PurchaseOrderController::class, 'store'])->middleware('permission:purchasing.manage');
    Route::put('/purchase-orders/{id}', [PurchaseOrderController::class, 'update'])->middleware('permission:purchasing.manage');
    Route::delete('/purchase-orders/{id}', [PurchaseOrderController::class, 'destroy'])->middleware('permission:purchasing.manage');
    Route::patch('/purchase-orders/{id}/restore', [PurchaseOrderController::class, 'restore'])->middleware('permission:purchasing.manage');
    Route::delete('/purchase-orders/{id}/force', [PurchaseOrderController::class, 'forceDelete'])->middleware('permission:purchasing.manage');
    Route::post('/purchase-orders/{id}/submit', [PurchaseOrderController::class, 'submit'])->middleware('permission:purchasing.manage');
    Route::post('/purchase-orders/{id}/approve', [PurchaseOrderController::class, 'approve'])->middleware('permission:purchasing.manage');
    Route::post('/purchase-orders/{id}/cancel', [PurchaseOrderController::class, 'cancel'])->middleware('permission:purchasing.manage');
    Route::post('/purchase-orders/{id}/close', [PurchaseOrderController::class, 'close'])->middleware('permission:purchasing.manage');
    Route::post('/purchase-orders/{id}/reopen', [PurchaseOrderController::class, 'reopen'])->middleware('permission:purchasing.manage');

    // Goods Receipts
    Route::get('/goods-receipts', [GoodsReceiptController::class, 'index'])->middleware('check.permission:purchasing.view,purchasing.manage');
    Route::get('/goods-receipts/{id}', [GoodsReceiptController::class, 'show'])->middleware('check.permission:purchasing.view,purchasing.manage');
    Route::get('/goods-receipts/{id}/download-pdf', [GoodsReceiptController::class, 'downloadPdf'])->middleware('check.permission:purchasing.view,purchasing.manage');
    Route::post('/goods-receipts', [GoodsReceiptController::class, 'store'])->middleware('permission:purchasing.manage');
    Route::put('/goods-receipts/{id}', [GoodsReceiptController::class, 'update'])->middleware('permission:purchasing.manage');
    Route::delete('/goods-receipts/{id}', [GoodsReceiptController::class, 'destroy'])->middleware('permission:purchasing.manage');
    Route::patch('/goods-receipts/{id}/restore', [GoodsReceiptController::class, 'restore'])->middleware('permission:purchasing.manage');
    Route::delete('/goods-receipts/{id}/force', [GoodsReceiptController::class, 'forceDelete'])->middleware('permission:purchasing.manage');
    Route::post('/goods-receipts/{id}/receive', [GoodsReceiptController::class, 'receive'])->middleware('permission:purchasing.manage');
    Route::post('/goods-receipts/{id}/approve', [GoodsReceiptController::class, 'approve'])->middleware('permission:purchasing.manage');
    Route::post('/goods-receipts/{id}/cancel', [GoodsReceiptController::class, 'cancel'])->middleware('permission:purchasing.manage');
    Route::post('/goods-receipts/{id}/return/request', [GoodsReceiptController::class, 'requestReturn'])->middleware('permission:purchasing.manage');
    Route::post('/goods-receipts/{id}/return/approve', [GoodsReceiptController::class, 'approveReturn'])->middleware('permission:purchasing.manage');
    Route::post('/goods-receipts/{id}/return/reject', [GoodsReceiptController::class, 'rejectReturn'])->middleware('permission:purchasing.manage');

    // Supplier Bills
    Route::get('/supplier-bills', [SupplierBillController::class, 'index'])->middleware('check.permission:purchasing.view,purchasing.manage');
    Route::get('/supplier-bills/{id}', [SupplierBillController::class, 'show'])->middleware('check.permission:purchasing.view,purchasing.manage');
    Route::get('/supplier-bills/{id}/download-pdf', [SupplierBillController::class, 'downloadPdf'])->middleware('check.permission:purchasing.view,purchasing.manage');
    Route::post('/supplier-bills', [SupplierBillController::class, 'store'])->middleware('permission:purchasing.manage');
    Route::delete('/supplier-bills/{id}', [SupplierBillController::class, 'destroy'])->middleware('permission:purchasing.manage');
    Route::patch('/supplier-bills/{id}/restore', [SupplierBillController::class, 'restore'])->middleware('permission:purchasing.manage');
    Route::delete('/supplier-bills/{id}/force', [SupplierBillController::class, 'forceDelete'])->middleware('permission:purchasing.manage');
    Route::post('/supplier-bills/{id}/approve', [SupplierBillController::class, 'approve'])->middleware('permission:purchasing.manage');
    Route::post('/supplier-bills/{id}/pay', [SupplierBillController::class, 'pay'])->middleware('permission:purchasing.manage');
    Route::post('/supplier-bills/{id}/void', [SupplierBillController::class, 'void'])->middleware('permission:purchasing.manage');

    // Stock Movements
    Route::get('/stock-movements', [StockMovementController::class, 'index'])->middleware('check.permission:purchasing.view,purchasing.manage');
});
