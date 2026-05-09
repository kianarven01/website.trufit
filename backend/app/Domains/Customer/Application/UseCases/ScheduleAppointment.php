<?php

namespace App\Domains\Customer\Application\UseCases;

use App\Domains\Customer\Application\DTOs\AppointmentDTO;
use App\Domains\Customer\Domain\Models\Customer;
use App\Domains\Customer\Domain\Models\CustomerVehicle;
use App\Domains\Customer\Domain\Repositories\AppointmentRepositoryInterface;
use Illuminate\Support\Facades\DB;

class ScheduleAppointment
{
    public function __construct(
        protected AppointmentRepositoryInterface $appointmentRepo
    ) {}

    public function execute(AppointmentDTO $dto)
    {
        $this->validateAppointmentDate($dto->datetime);

        return DB::transaction(function () use ($dto) {
            $customerID = null;
            $plate_number = null;

            // Only create/link customer and vehicle if status is "confirmed"
            if ($dto->status === 'confirmed') {
                // 1. Check if the Vehicle already exists
                $vehicle = CustomerVehicle::where('plate_number', $dto->plateNumber)->first();

                if ($vehicle && $vehicle->customerID) {
                    // If vehicle exists, we link to the EXISTING owner
                    $customerID = $vehicle->customerID;
                    
                    // Allow fixing typos if it's safe (no history)
                    if ($this->isVehicleSafeToUpdate($vehicle->id)) {
                        $vehicle->update([
                            'make' => $dto->make,
                            'model' => $dto->model,
                            'year_model' => $dto->year ?? $vehicle->year_model,
                        ]);
                    }
                } else {
                    // If new vehicle or no owner, we find/create the customer by phone
                    $customer = Customer::firstOrCreate(
                        ['mobile_number' => $dto->phone],
                        [
                            'first_name' => $dto->firstName,
                            'last_name' => $dto->lastName,
                            'email' => $dto->email,
                            'address' => '',
                        ]
                    );
                    $customerID = $customer->customer_id;

                    if ($vehicle) {
                        // Link the existing ownerless vehicle to this customer
                        $vehicle->update(['customerID' => $customerID]);
                    } else {
                        // Create brand new vehicle
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
                }
                
                $plate_number = $vehicle->plate_number;
                $vehicle_id = $vehicle->id;

                $this->syncVehicleCatalog($dto->make, $dto->model);
            } else {
                // For "for approval", just use the plate number from the DTO
                $plate_number = $dto->plateNumber;

                // Proactively link to existing vehicle if found
                $existingVehicle = CustomerVehicle::where('plate_number', $dto->plateNumber)->first();
                $vehicle_id = $existingVehicle?->id;
            }

            $appointmentCode = $this->appointmentRepo->getNextAppointmentCode();

            return $this->appointmentRepo->create([
                'appointment_code' => $appointmentCode,
                'customer_id' => $customerID,
                'vehicle_id' => $vehicle_id,
                'plate_number' => $plate_number ?: null,
                
                // Lead Info (Always store these for reference)
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
        });
    }

    private function validateAppointmentDate(string $datetime)
    {
        $date = new \DateTime($datetime);
        $now = new \DateTime();

        // 1. Prevent Past Dates (with a 5-minute grace period for network lag)
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

    private function isVehicleSafeToUpdate(int $vehicleId): bool
    {
        // 1. Check for other appointments
        $hasOtherAppointments = DB::table('Main.Appointments')
            ->where('vehicle_id', $vehicleId)
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
}
