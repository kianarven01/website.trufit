<?php

namespace App\Domains\Auth\Application\DTOs;

class UpdateProfileDTO
{
    public function __construct(
        public readonly string $name,
        public readonly ?string $address,
        public readonly ?string $phone,
        public readonly string $username,
    ) {}

    public static function fromRequest($request): self
    {
        return new self(
            name: $request->validated('name'),
            address: $request->validated('address'),
            phone: $request->validated('phone'),
            username: $request->validated('username'),
        );
    }
}