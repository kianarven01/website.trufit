<?php

namespace App\Domains\Auth\Exceptions;

class InvalidVerificationCodeException extends AuthDomainException 
{
    protected $message = 'The verification code provided is invalid.';
}