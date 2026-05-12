<?php

namespace App\Domains\Customer\Application\UseCases;

use App\Domains\Customer\Domain\Models\Customer;
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
        // Gate: Never auto-purge manually created customers
        $customer = Customer::find($customerId);
        if (!$customer || $customer->origin === 'manual') return false;

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

        // 3. Check for Billing Statements
        $hasBilling = DB::table('Main.BillingStatement')
            ->where('CustomerID', $customerId)
            ->exists();

        if ($hasBilling) return false;

        // 4. Check vehicles for Job Orders, Warranties, Estimates
        $vehicleIds = DB::table('Main.CustomerVehicles')
            ->where('customerID', $customerId)
            ->pluck('id');

        foreach ($vehicleIds as $vehicleId) {
            $hasJobOrders = DB::table('Main.JobOrder')
                ->where('vehicle_id_new', $vehicleId)
                ->exists();
            if ($hasJobOrders) return false;

            $hasWarranties = DB::table('Main.Warranties')
                ->where('vehicle_id_new', $vehicleId)
                ->exists();
            if ($hasWarranties) return false;

            $hasEstimates = DB::table('Main.Estimates')
                ->where('vehicle_id', $vehicleId)
                ->exists();
            if ($hasEstimates) return false;
        }

        return true;
    }

    private function deleteCustomerRecords(int $customerId)
    {
        try {
            // Unlink any remaining appointments still pointing here to avoid FK errors
            DB::table('Main.Appointments')
                ->where('customer_id', $customerId)
                ->update(['customer_id' => null, 'vehicle_id' => null]);

            DB::table('Main.CustomerVehicles')->where('customerID', $customerId)->delete();
            DB::table('Main.Customers')->where('customer_id', $customerId)->delete();
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Failed to purge customer {$customerId} during appointment deletion: " . $e->getMessage());
        }
    }
}
