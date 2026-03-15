<?php

namespace App\Domains\Auth\Exceptions;

class AccountNotFoundException extends AuthDomainException 
{
    protected $statusCode = 404;
    protected $message = 'No account was found with the provided details.';
}