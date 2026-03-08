<?php

namespace App\Domains\Auth\Domain\ValueObjects;

use App\Domains\Shared\Exceptions\InvalidCredentialsException;


readonly class Password
{
    public function __construct(public string $value)
    {
        if (empty($value)) {
            throw new InvalidCredentialsException();
        }
    }

    public function verify(string $hash): bool
    {
        return password_verify($this->value, $hash);
    }
}