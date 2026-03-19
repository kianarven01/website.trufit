<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Supplier\Http\Controllers\SupplierController;

Route::get('/suppliers', [SupplierController::class, 'index']);
