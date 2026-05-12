<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Supplier\Http\Controllers\SupplierController;

Route::prefix('suppliers')->group(function () {
    Route::get('/', [SupplierController::class, 'index']);
});