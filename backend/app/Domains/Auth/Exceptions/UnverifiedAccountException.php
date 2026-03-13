<?php

namespace App\Domains\Auth\Exceptions;

class UnverifiedAccountException extends AuthDomainException 
{
    protected $statusCode = 403;
    protected $message = 'Your account is not verified. Please contact an administrator.';
}