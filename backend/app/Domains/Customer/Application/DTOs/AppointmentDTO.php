<?php

namespace App\Domains\Customer\Application\DTOs;

class AppointmentDTO
{
    public function __construct(
        public string $firstName,
        public string $lastName,
        public string $phone,
        public ?string $email,
        public string $make,
        public string $model,
        public string $plateNumber,
        public string $datetime,
        public array $services,
        public ?string $notes,
        public ?string $status = 'for approval'
    ) {}

    public static function fromRequest(\Illuminate\Http\Request $request): self
    {
        return new self(
            firstName: $request->firstName,
            lastName: $request->lastName,
            phone: $request->phone,
            email: $request->email,
            make: $request->make,
            model: $request->model,
            plateNumber: $request->plateNumber,
            datetime: $request->datetime,
            services: $request->services ?? [],
            notes: $request->notes,
            status: $request->status ?? 'for approval'
        );
    }
}
