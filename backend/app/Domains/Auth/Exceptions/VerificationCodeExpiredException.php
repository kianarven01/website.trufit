<?php

namespace App\Domains\Auth\Exceptions;

class VerificationCodeExpiredException extends AuthDomainException 
{
    protected $message = 'The verification code has expired.';
}