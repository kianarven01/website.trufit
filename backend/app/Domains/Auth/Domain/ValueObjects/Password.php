<?php

namespace App\Domains\Auth\Domain\ValueObjects;

use App\Shared\Exceptions\PasswordInvalidException;
use InvalidArgumentException;

readonly class Password
{
    public function __construct(public string $value)
    {
        if (empty($value)) {
            throw new PasswordInvalidException();
        }
    }

    public function verify(string $hash): bool
    {
        return password_verify($this->value, $hash);
    }
}