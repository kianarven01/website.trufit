<?php

use Illuminate\Support\Facades\Route;
use App\Domains\Auth\Http\Controllers\LoginController;


// for login and auth
Route::post('/login', LoginController::class);



