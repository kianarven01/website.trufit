<?php

namespace App\Domains\Customer\Application\DTOs;

class CustomerDTO
{
    public function __construct(
        public string $first_name,
        public string $last_name,
        public string $mobile_number,
        public string $address,
        public ?string $landline,
        public ?string $email,
        public ?string $business,
        public array $vehicles = []
    ) {}

    public static function fromRequest(\Illuminate\Http\Request $request): self
    {
        return new self(
            first_name: $request->first_name,
            last_name: $request->last_name,
            mobile_number: $request->mobile_number,
            address: $request->address,
            landline: $request->landline,
            email: $request->email,
            business: $request->business,
            vehicles: $request->vehicles ?? []
        );
    }
}
