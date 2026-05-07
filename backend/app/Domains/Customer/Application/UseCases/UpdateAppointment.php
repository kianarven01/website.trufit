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

            // 1. Handle Customer Sync
            $customer = null;
            if ($customerID) {
                $customer = Customer::find($customerID);
                if ($customer) {
                    $customer->update([
                        'first_name' => $dto->firstName,
                        'last_name' => $dto->lastName,
                        'email' => $dto->email,
                        'mobile_number' => $dto->phone,
                    ]);
                }
            } elseif ($dto->status === 'confirmed') {
                $customer = Customer::firstOrCreate(
                    ['mobile_number' => $dto->phone],
                    [
                        'first_name' => $dto->firstName,
                        'last_name' => $dto->lastName,
                        'email' => $dto->email,
                        'address' => '',
                    ]
                );
                // Sync in case info was different
                $customer->update([
                    'first_name' => $dto->firstName,
                    'last_name' => $dto->lastName,
                    'email' => $dto->email,
                ]);
                $customerID = $customer->customer_id;
            }

            // 2. Handle Vehicle Sync
            if ($dto->status === 'confirmed' || $appointment->vehicle_id) {
                $vehicle = null;
                $existingByPlate = CustomerVehicle::where('plate_number', $dto->plateNumber)->first();

                if ($appointment->vehicle_id) {
                    $vehicle = CustomerVehicle::find($appointment->vehicle_id);
                    
                    if ($existingByPlate && $existingByPlate->id !== $vehicle->id) {
                        $vehicle = $existingByPlate;
                    }

                    $vehicle->update([
                        'plate_number' => $dto->plateNumber,
                        'customerID' => $customerID,
                        'make' => $dto->make,
                        'model' => $dto->model,
                        'year_model' => $dto->year ?? '',
                    ]);
                } else {
                    $vehicle = CustomerVehicle::updateOrCreate(
                        ['plate_number' => $dto->plateNumber],
                        [
                            'customerID' => $customerID,
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
                }
                $plate_number = $vehicle->plate_number;
                $vehicle_id = $vehicle->id;
            } elseif ($dto->status === 'cancelled' && $customerID) {
                // Check if this customer should be purged
                if ($this->isCustomerSafeToPurge($customerID, $id)) {
                    $shouldPurge = true;
                    // Unlink from customer relation but KEEP the plate number string
                    $customerID = null;
                }
            } else {
                // Proactively link to existing vehicle if found
                $existingVehicle = CustomerVehicle::where('plate_number', $dto->plateNumber)->first();
                $vehicle_id = $existingVehicle?->id ?? $appointment->vehicle_id;
            }

            $result = $this->appointmentRepo->update($id, [
                'customer_id' => $customerID,
                'vehicle_id' => $vehicle_id,
                'plate_number' => $dto->plateNumber ?: $plate_number ?: null,
                
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
