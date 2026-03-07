<?php


use Illuminate\Support\Facades\Route;
use App\Domains\KeyManagement\Http\Controllers\KeyController;

Route::post('/admin/onboard-employee', [KeyController::class, 'store']);
Route::get('/admin/registration-keys', [KeyController::class, 'index']);

