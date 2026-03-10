<?php

namespace App\Domains\Auth\Exceptions;

use Exception;

class AuthDomainException extends Exception 
{
    protected $statusCode = 400;

    public function getStatusCode()
    {
        return $this->statusCode;
    }
}

class InvalidVerificationCodeException extends AuthDomainException 
{
    protected $message = 'The verification code provided is invalid.';
}

class VerificationCodeExpiredException extends AuthDomainException 
{
    protected $message = 'The verification code has expired.';
}

class UnverifiedAccountException extends AuthDomainException 
{
    protected $statusCode = 403;
    protected $message = 'Your account is not verified. Please contact an administrator.';
}

class AccountNotFoundException extends AuthDomainException 
{
    protected $statusCode = 404;
    protected $message = 'No account was found with the provided details.';
}