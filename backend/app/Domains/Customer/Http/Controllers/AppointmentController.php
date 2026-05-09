<?php

namespace App\Domains\Customer\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Domains\Customer\Application\DTOs\AppointmentDTO;
use App\Domains\Customer\Application\UseCases\ScheduleAppointment;
use App\Domains\Customer\Application\UseCases\UpdateAppointment;
use App\Domains\Customer\Application\UseCases\CancelAppointment;
use App\Domains\Customer\Domain\Repositories\AppointmentRepositoryInterface;
use Illuminate\Support\Facades\Log;

class AppointmentController extends Controller
{
    public function __construct(
        protected AppointmentRepositoryInterface $appointmentRepo,
        protected ScheduleAppointment $scheduleAppointment,
        protected UpdateAppointment $updateAppointment,
        protected CancelAppointment $cancelAppointment
    ) {}

    public function index()
    {
        $appointments = $this->appointmentRepo->getAll();
        return response()->json([
            'status' => 'success',
            'data' => $appointments
        ]);
    }

    public function store(Request $request)
    {
        $dto = AppointmentDTO::fromRequest($request);

        try {
            $appointment = $this->scheduleAppointment->execute($dto);

            return response()->json([
                'status' => 'success',
                'message' => 'Appointment created successfully',
                'data' => $appointment->load(['customer', 'vehicle'])
            ]);
        } catch (\Exception $e) {
            Log::error('Appointment creation failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create appointment: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $dto = AppointmentDTO::fromRequest($request);

        try {
            $appointment = $this->updateAppointment->execute((int)$id, $dto);

            return response()->json([
                'status' => 'success',
                'message' => 'Appointment updated successfully',
                'data' => $appointment->load(['customer', 'vehicle'])
            ]);
        } catch (\Exception $e) {
            Log::error('Appointment update failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update appointment: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $this->cancelAppointment->execute((int)$id);

            return response()->json([
                'status' => 'success',
                'message' => 'Appointment cancelled successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Appointment cancellation failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to cancel appointment: ' . $e->getMessage()
            ], 500);
        }
    }
}
