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
                    'year_model' => '',
                    'variant' => '',
                    'selling_dealer' => ''
                ]
            );

            return $this->appointmentRepo->update($id, [
                'customerID' => $customer->customer_id,
                'plate_number' => $vehicle->plate_number,
                'appointment_datetime' => $dto->datetime,
                'status' => $dto->status,
                'services' => $dto->services,
                'notes' => $dto->notes
            ]);
        });
    }
}
