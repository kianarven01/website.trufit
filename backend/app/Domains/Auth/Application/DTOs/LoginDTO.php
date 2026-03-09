<?php

namespace App\Domains\Auth\Application\DTOs;

use App\Domains\Auth\Http\Requests\LoginRequest;

readonly class LoginDTO
{
    public function __construct(
        public string $username,
        public string $password,
        public bool $remember = false 
    ) {}

    /**
     * Maps the validated request data to the DTO.
     */
    public static function fromRequest(LoginRequest $request): self
    {
        return new self(
            username: $request->validated('username'),
            password: $request->validated('password'),
            // Map the 'remember' field from the request
            remember: (bool) $request->input('remember', false) 
        );
    }
}