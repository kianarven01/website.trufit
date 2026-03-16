<?php

namespace App\Domains\Shared\Exceptions;
use Illuminate\Http\JsonResponse;

use Exception;

class InvalidCredentialsException extends Exception
{
    protected $message = "Invalid credentials. Please try again.";
    protected $code = 401; // Unauthorized

    public function render($request): JsonResponse
    {
        return response()->json([
            'status' => 'error',
            'message' => $this->message,
            'code' => 'CREDENTIALS_INVALID' 
        ], $this->code);
    }
}



  