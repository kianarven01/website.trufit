<?php

namespace App\Domains\KeyManagement\Application\DTOs;

class GenerateKeyDTO
{
    public function __construct(
        public readonly string $firstName,
        public readonly string $lastName,
        public readonly string $email,
        public readonly string $position,
        public readonly int $roleId,
        public readonly ?string $phone = null,
        public readonly ?string $address = null,
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            firstName: $data['first_name'],
            lastName: $data['last_name'],
            email: $data['email'],
            position: $data['position'],
            roleId: (int) $data['role_id'],
            phone: $data['phone'] ?? null,
            address: $data['address'] ?? null,
        );
    }
}