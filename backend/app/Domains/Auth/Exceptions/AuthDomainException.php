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