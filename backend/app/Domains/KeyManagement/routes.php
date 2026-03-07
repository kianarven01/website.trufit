<?php


use Illuminate\Support\Facades\Route;
use App\Domains\KeyManagement\Http\Controllers\KeyController;

Route::post('/admin/onboard-employee', [KeyController::class, 'store']);
// Also move the registration keys list here to keep the Key domain together
Route::get('/admin/registration-keys', [KeyController::class, 'index']);