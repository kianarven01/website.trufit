<?php

namespace App\Domains\Shared\Exceptions;
use Illuminate\Http\JsonResponse;

use Exception;

class InvalidCredentialsException extends Exception
{
    protected $message = "Invalid Credentials.";
    protected $code = 422; // Unauthorized

    public function render($request): JsonResponse
    {
        return response()->json([
            'status' => 'error',
            'message' => $this->message,
            'code' => 'CREDENTIALS_INVALID' 
        ], $this->code);
    }
}



  