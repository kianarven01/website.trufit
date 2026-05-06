<?php

namespace App\Domains\Customer\Application\UseCases;

use App\Domains\Customer\Application\DTOs\AppointmentDTO;
use App\Domains\Customer\Domain\Models\Customer;
use App\Domains\Customer\Domain\Models\CustomerVehicle;
use App\Domains\Customer\Domain\Repositories\AppointmentRepositoryInterface;
use Illuminate\Support\Facades\DB;

class UpdateAppointment
{
    public function __construct(
        protected AppointmentRepositoryInterface $appointmentRepo
    ) {}

    public function execute(int $id, AppointmentDTO $dto)
    {
        return DB::transaction(function () use ($id, $dto) {
            $appointment = $this->appointmentRepo->findById($id);
            $customerID = $appointment->customer_id;
            $plate_number = $appointment->plate_number;

            $shouldPurge = false;

            // If confirmed, create or link real records
            if ($dto->status === 'confirmed') {
                $customer = Customer::firstOrCreate(
                    ['mobile_number' => $dto->phone],
                    [
                        'first_name' => $dto->firstName,
                        'last_name' => $dto->lastName,
                        'email' => $dto->email,
                        'address' => '',
                    ]
                );

                // Sync customer info
                $customer->update([
                    'first_name' => $dto->firstName,
                    'last_name' => $dto->lastName,
                    'email' => $dto->email,
                ]);

                $vehicle = CustomerVehicle::firstOrCreate(
                    ['plate_number' => $dto->plateNumber],
                    [
                        'customerID' => $customer->customer_id,
                        'make' => $dto->make,
                        'model' => $dto->model,
                        'year_model' => $dto->year ?? '',
                        'variant' => '',
                        'selling_dealer' => '',
                        'engine_number' => '',
                        'VIN' => '',
                        'color' => '',
                        'registration_number' => ''
                    ]
                );

                $customerID = $customer->customer_id;
                $plate_number = $vehicle->plate_number;
            } elseif ($dto->status === 'cancelled' && $customerID) {
                // Check if this customer should be purged
                if ($this->isCustomerSafeToPurge($customerID, $id)) {
                    $shouldPurge = true;
                    // Unlink from customer relation but KEEP the plate number string
                    $customerID = null;
                }
            }

            $result = $this->appointmentRepo->update($id, [
                'customer_id' => $customerID,
                'plate_number' => $plate_number ?? $dto->plateNumber,
                
                // Keep lead info updated too
                'first_name' => $dto->firstName,
                'last_name' => $dto->lastName,
                'phone' => $dto->phone,
                'email' => $dto->email,
                'make' => $dto->make,
                'model' => $dto->model,
                'year' => $dto->year,

                'appointment_datetime' => $dto->datetime,
                'status' => $dto->status,
                'services' => $dto->services,
                'notes' => $dto->notes
            ]);

            if ($shouldPurge) {
                $origCustomerID = $appointment->customer_id;
                $this->deleteCustomerRecords($origCustomerID);
            }

            return $result;
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
            // Unlink any cancelled appointments still pointing here to avoid FK errors
            DB::table('Main.Appointments')
                ->where('customer_id', $customerId)
                ->update(['customer_id' => null, 'plate_number' => null]);

            DB::table('Main.CustomerVehicles')->where('customerID', $customerId)->delete();
            DB::table('Main.Customers')->where('customer_id', $customerId)->delete();
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Failed to purge customer {$customerId}: " . $e->getMessage());
        }
    }
}
