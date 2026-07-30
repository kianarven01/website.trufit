<?php

use Illuminate\Support\Facades\Route;
use App\Domains\JobOrder\Http\Controllers\JobOrderController;

Route::prefix('job-orders')->group(function () {
    // View routes
    Route::get('/', [JobOrderController::class, 'index'])->middleware('check.permission:services.view_job_orders,services.manage_job_orders');
    Route::get('/technician-options', [JobOrderController::class, 'getTechnicianOptions'])->middleware('check.permission:services.view_job_orders,services.manage_job_orders');
    Route::get('/{id}', [JobOrderController::class, 'show'])->middleware('check.permission:services.view_job_orders,services.manage_job_orders');
    Route::get('/{id}/download-pdf', [JobOrderController::class, 'downloadPdf'])->middleware('check.permission:services.view_job_orders,services.manage_job_orders');
    Route::get('/{id}/technicians', [JobOrderController::class, 'getTechnicians'])->middleware('check.permission:services.view_job_orders,services.manage_job_orders');

    // Manage routes
    Route::patch('/{id}/notes', [JobOrderController::class, 'updateNotes'])->middleware('permission:services.manage_job_orders');
    Route::patch('/{id}/status', [JobOrderController::class, 'updateStatus'])->middleware('permission:services.manage_job_orders');
    Route::post('/{id}/technicians', [JobOrderController::class, 'assignTechnician'])->middleware('permission:services.manage_job_orders');
    Route::delete('/{id}/technicians/{technicianId}', [JobOrderController::class, 'removeTechnician'])->middleware('permission:services.manage_job_orders');

    // Timer routes (manage)
    Route::post('/{id}/timer/start', [JobOrderController::class, 'startTimer'])->middleware('permission:services.manage_job_orders');
    Route::post('/{id}/timer/pause', [JobOrderController::class, 'pauseTimer'])->middleware('permission:services.manage_job_orders');
    Route::post('/{id}/timer/resume', [JobOrderController::class, 'resumeTimer'])->middleware('permission:services.manage_job_orders');
    Route::post('/{id}/timer/stop', [JobOrderController::class, 'stopTimer'])->middleware('permission:services.manage_job_orders');
});
