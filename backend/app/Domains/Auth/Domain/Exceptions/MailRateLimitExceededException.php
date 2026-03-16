<?php

namespace App\Domains\Auth\Domain\Exceptions;

use RuntimeException;

class MailRateLimitExceededException extends RuntimeException
{
    public function __construct(string $limitType = 'daily')
    {
        parent::__construct(
            "Email {$limitType} rate limit exceeded. Please try again later."
        );
    }
}
