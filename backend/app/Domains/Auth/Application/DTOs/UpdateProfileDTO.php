<?php

namespace App\Domains\Auth\Application\DTOs;

class UpdateProfileDTO
{
    public function __construct(
        public readonly string $first_name,
        public readonly string $last_name,
        public readonly ?string $address,
        public readonly ?string $phone,
        public readonly string $username,
    ) {}

    public static function fromRequest($request): self
    {
        return new self(
            first_name: $request->validated('first_name'),
            last_name: $request->validated('last_name'),
            address: $request->validated('address'),
            phone: $request->validated('phone'),
            username: $request->validated('username'),
        );
    }
}