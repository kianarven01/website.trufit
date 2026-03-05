<?php

namespace App\Shared\Exceptions;
use Exception;

class PasswordInvalidException extends Exception
{
    protected $message = "Password is invalid.";
    protected $code = 401; // Unauthorized
}