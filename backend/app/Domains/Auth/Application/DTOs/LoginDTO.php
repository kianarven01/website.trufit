<?php

namespace App\Domains\Auth\Application\DTOs;

use App\Domains\Auth\Http\Requests\LoginRequest;

readonly class LoginDTO
{
    public function __construct(
        public string $username,
        public string $password
    ) {}

    /**
     * Maps the validated request data to the DTO.
     */
    public static function fromRequest(LoginRequest $request): self
    {
        return new self(
            username: $request->validated('username'),
            password: $request->validated('password')
        );
    }
}