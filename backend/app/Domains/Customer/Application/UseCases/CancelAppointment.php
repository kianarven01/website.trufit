<?php

namespace App\Domains\Customer\Application\UseCases;

use App\Domains\Customer\Domain\Repositories\AppointmentRepositoryInterface;
use Illuminate\Support\Facades\DB;

class CancelAppointment
{
    public function __construct(
        protected AppointmentRepositoryInterface $appointmentRepo
    ) {}

    public function execute(int $id)
    {
        return DB::transaction(function () use ($id) {
            $appointment = $this->appointmentRepo->findById($id);
            if (!$appointment) return false;

            $customerId = $appointment->customer_id;
            $shouldPurge = false;

            if ($customerId && $this->isCustomerSafeToPurge($customerId, $id)) {
                $shouldPurge = true;
            }
            
            // Delete the appointment first
            $deleted = $this->appointmentRepo->delete($id);

            // If it was linked and safe to purge, do it now
            if ($shouldPurge) {
                $this->deleteCustomerRecords($customerId);
            }

            return $deleted;
        });
    }

    private function isCustomerSafeToPurge(int $customerId, int $excludeAppointmentId): bool
    {
        // 1. Check for other non-cancelled appointments
        $hasOtherActiveAppointments = DB::table('Main.Appointments')
            ->where('customer_id', $customerId)
            ->where('id', '!=', $excludeAppointmentId)
            ->where('status', '!=', 'cancelled')
            ->exists();

        if ($hasOtherActiveAppointments) return false;

        // 2. Check for Sales Orders (History)
        $hasSalesOrders = DB::table('Main.SalesOrder')
            ->where('customerID', $customerId)
            ->exists();

        if ($hasSalesOrders) return false;

        return true;
    }

    private function deleteCustomerRecords(int $customerId)
    {
        try {
            // Unlink any remaining appointments still pointing here to avoid FK errors
            DB::table('Main.Appointments')
                ->where('customer_id', $customerId)
                ->update(['customer_id' => null, 'plate_number' => null]);

            DB::table('Main.CustomerVehicles')->where('customerID', $customerId)->delete();
            DB::table('Main.Customers')->where('customer_id', $customerId)->delete();
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Failed to purge customer {$customerId} during appointment deletion: " . $e->getMessage());
        }
    }
}
