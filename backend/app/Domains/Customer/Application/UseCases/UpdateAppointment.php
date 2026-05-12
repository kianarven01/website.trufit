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

            // Only validate date if it has been changed
            if ($appointment->appointment_datetime->format('Y-m-d H:i') !== date('Y-m-d H:i', strtotime($dto->datetime))) {
                $this->validateAppointmentDate($dto->datetime);
            }

            $customerID = $appointment->customer_id;
            $plate_number = $appointment->plate_number;

            $shouldPurge = false;

            // 1. Handle Customer & Vehicle Sync (Owner-First Approach)
            $vehicle_id = $appointment->vehicle_id;
            $existingByPlate = CustomerVehicle::where('plate_number', $dto->plateNumber)->first();

            if ($dto->status === 'confirmed' || $vehicle_id) {
                // If the vehicle already exists and has an owner, we prioritize that owner
                if ($existingByPlate && $existingByPlate->customerID) {
                    $customerID = $existingByPlate->customerID;
                } elseif (!$customerID) {
                    // Otherwise, find/create customer by phone if not already linked
                    $customer = Customer::firstOrCreate(
                        ['mobile_number' => $dto->phone],
                        [
                            'first_name' => $dto->firstName,
                            'last_name' => $dto->lastName,
                            'email' => $dto->email,
                            'address' => '',
                            'origin' => 'appointment',
                        ]
                    );
                    $customerID = $customer->customer_id;
                }

                // Now handle the Vehicle record itself
                if ($vehicle_id) {
                    $vehicle = CustomerVehicle::find($vehicle_id);
                    
                    // If plate was changed to one that ALREADY exists
                    if ($existingByPlate && $existingByPlate->id !== $vehicle->id) {
                        $vehicle = $existingByPlate;
                    }

                    $isSafeToUpdate = $this->isVehicleSafeToUpdate($vehicle->id, $id);

                    $updateData = [
                        'customerID' => $vehicle->customerID ?: $customerID, // Only set if empty
                    ];

                    if ($isSafeToUpdate) {
                        $updateData['make'] = $dto->make;
                        $updateData['model'] = $dto->model;
                        $updateData['year_model'] = $dto->year ?? $vehicle->year_model;

                        if ($vehicle->plate_number !== $dto->plateNumber) {
                            $updateData['plate_number'] = $dto->plateNumber;
                        }
                    }

                    $vehicle->update($updateData);
                    $vehicle_id = $vehicle->id;
                    $plate_number = $vehicle->plate_number;
                } else {
                    // No vehicle linked yet, so we use the one found by plate or create new
                    if ($existingByPlate) {
                        $vehicle = $existingByPlate;
                        if (!$vehicle->customerID) {
                            $vehicle->update(['customerID' => $customerID]);
                        }
                    } else {
                        $vehicle = CustomerVehicle::create([
                            'plate_number' => $dto->plateNumber,
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
                        ]);
                    }
                    $vehicle_id = $vehicle->id;
                    $plate_number = $vehicle->plate_number;
                }

                $this->syncVehicleCatalog($dto->make, $dto->model);
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

        // 4. Check vehicles for history
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
            // Unlink any cancelled appointments still pointing here to avoid FK errors
            DB::table('Main.Appointments')
                ->where('customer_id', $customerId)
                ->update(['customer_id' => null, 'vehicle_id' => null]);

            DB::table('Main.CustomerVehicles')->where('customerID', $customerId)->delete();
            DB::table('Main.Customers')->where('customer_id', $customerId)->delete();
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Failed to purge customer {$customerId}: " . $e->getMessage());
        }
    }

    private function isVehicleSafeToUpdate(int $vehicleId, int $excludeAppointmentId): bool
    {
        // 1. Check for other appointments
        $hasOtherAppointments = DB::table('Main.Appointments')
            ->where('vehicle_id', $vehicleId)
            ->where('id', '!=', $excludeAppointmentId)
            ->exists();

        if ($hasOtherAppointments) return false;

        // 2. Check for Job Orders (Using the new vehicle_id column from migrations)
        $hasJobOrders = DB::table('Main.JobOrder')
            ->where('vehicle_id_new', $vehicleId)
            ->exists();
        if ($hasJobOrders) return false;

        // 3. Check for Warranties
        $hasWarranties = DB::table('Main.Warranties')
            ->where('vehicle_id_new', $vehicleId)
            ->exists();
        if ($hasWarranties) return false;

        // 4. Check for Estimates
        $hasEstimates = DB::table('Main.Estimates')
            ->where('vehicle_id', $vehicleId)
            ->exists();
        if ($hasEstimates) return false;

        return true;
    }

    private function validateAppointmentDate(string $datetime)
    {
        $date = new \DateTime($datetime);
        $now = new \DateTime();

        // 1. Prevent Past Dates (5-minute grace period)
        if ($date < $now->modify('-5 minutes')) {
            throw new \Exception("Cannot schedule an appointment in the past.");
        }

        // 2. Prevent Sundays (0 = Sunday)
        if ($date->format('w') === '0') {
            throw new \Exception("The shop is closed on Sundays. Please choose another date.");
        }
    }

    private function syncVehicleCatalog(string $make, string $model)
    {
        $make = trim($make);
        $model = trim($model);
        if (empty($make) || empty($model)) return;

        // Use case-insensitive lookup to prevent duplicates (Postgres ILIKE)
        $manufacturer = \App\Domains\Product\Domain\Models\Manufacturer::where('name', 'ILIKE', $make)
            ->where('type', 'Vehicle')
            ->first();

        if (!$manufacturer) {
            $manufacturer = \App\Domains\Product\Domain\Models\Manufacturer::create([
                'name' => ucfirst($make), 
                'type' => 'Vehicle'
            ]);
        }

        $vehicleModel = \App\Domains\Product\Domain\Models\VehicleModel::where('model', 'ILIKE', $model)
            ->where('manufacturer_id', $manufacturer->id)
            ->first();

        if (!$vehicleModel) {
            \App\Domains\Product\Domain\Models\VehicleModel::create([
                'model' => ucfirst($model), 
                'manufacturer_id' => $manufacturer->id
            ]);
        }
    }
}
