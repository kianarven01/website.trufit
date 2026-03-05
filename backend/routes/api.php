<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Auth\Http\Controllers\LoginController;
use App\Domains\Sales\Http\Controllers\SaleController;

//for system initialization check
Route::middleware(['system.initialized'])->group(function () {
    Route::post('/login', LoginController::class);

});