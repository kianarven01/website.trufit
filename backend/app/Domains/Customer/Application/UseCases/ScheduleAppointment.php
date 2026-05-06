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
        return DB::transaction(function () use ($dto) {
            $customerID = null;
            $plate_number = null;

            // Only create/link customer and vehicle if status is "confirmed"
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

                $vehicle = CustomerVehicle::firstOrCreate(
                    ['plate_number' => $dto->plateNumber],
                    [
                        'customerID' => $customer->customer_id,
                        'make' => $dto->make,
                        'model' => $dto->model,
                        'year_model' => $dto->year ?? '',
                        'variant' => '',
                        'selling_dealer' => '',
                        'engine_number' => '', // Mandatory in DB
                        'VIN' => '',           // Mandatory in DB
                        'color' => '',         // Mandatory in DB
                        'registration_number' => '' // Mandatory in DB
                    ]
                );

                $customerID = $customer->customer_id;
                $plate_number = $vehicle->plate_number;
            } else {
                // For "for approval", just use the plate number from the DTO
                $plate_number = $dto->plateNumber;
            }

            $appointmentCode = $this->appointmentRepo->getNextAppointmentCode();

            return $this->appointmentRepo->create([
                'appointment_code' => $appointmentCode,
                'customer_id' => $customerID,
                'plate_number' => $plate_number,
                
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
}
