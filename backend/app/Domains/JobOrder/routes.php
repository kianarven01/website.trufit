<?php

use Illuminate\Support\Facades\Route;
use App\Domains\JobOrder\Http\Controllers\JobOrderController;

Route::prefix('job-orders')->group(function () {
    // CRUD
    Route::get('/', [JobOrderController::class, 'index']);
    Route::get('/{id}', [JobOrderController::class, 'show']);
    Route::patch('/{id}/notes', [JobOrderController::class, 'updateNotes']);
    Route::patch('/{id}/status', [JobOrderController::class, 'updateStatus']);
    Route::get('/{id}/download-pdf', [JobOrderController::class, 'downloadPdf']);

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
