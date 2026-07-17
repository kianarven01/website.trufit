<?php

use Illuminate\Support\Facades\Route;
use App\Domains\JobOrder\Http\Controllers\JobOrderController;

Route::prefix('job-orders')->group(function () {
    // CRUD
    Route::get('/', [JobOrderController::class, 'index']);
    Route::post('/', [JobOrderController::class, 'store']);
    Route::get('/{id}', [JobOrderController::class, 'show']);
    Route::patch('/{id}', [JobOrderController::class, 'update']);
    Route::patch('/{id}/status', [JobOrderController::class, 'updateStatus']);

    // Timer
    Route::post('/{id}/timer/start', [JobOrderController::class, 'startTimer']);
    Route::post('/{id}/timer/pause', [JobOrderController::class, 'pauseTimer']);
    Route::post('/{id}/timer/resume', [JobOrderController::class, 'resumeTimer']);
    Route::post('/{id}/timer/stop', [JobOrderController::class, 'stopTimer']);

    // Technicians
    Route::get('/{id}/technicians', [JobOrderController::class, 'getTechnicians']);
    Route::post('/{id}/technicians', [JobOrderController::class, 'assignTechnician']);
    Route::delete('/{id}/technicians/{technicianId}', [JobOrderController::class, 'removeTechnician']);
});
