<?php

namespace App\Domains\Auth\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class AccountNotLinkedException extends Exception
{
    protected $message = 'This user account is not linked to an active employee record.';
    protected $code = 403;

    /**
     * This method is automatically called by Laravel 
     * when this exception is thrown and not caught.
     */
    public function render($request): JsonResponse
    {
        return response()->json([
            'status' => 'error',
            'message' => $this->message,
            'code' => 'ACCOUNT_NOT_LINKED' 
        ], $this->code);
    }
}
