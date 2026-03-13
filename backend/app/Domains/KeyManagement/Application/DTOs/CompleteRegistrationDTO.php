<?php

namespace App\Domains\KeyManagement\Application\DTOs;

class CompleteRegistrationDTO
{
    public function __construct(
        public readonly string $username,
        public readonly string $password,
        public readonly string $key_code
    ) {}

    public static function fromRequest(array $data): self
    {
        return new self(
            $data['username'],
            $data['password'],
            $data['key_code']
        );
    }
}