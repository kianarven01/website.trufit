<?php

namespace App\Domains\Auth\Domain\Exceptions;

use Exception;

class AccountNotLinkedException extends Exception
{
    protected $message = 'This user account is not linked to an active employee record.';
    protected $code = 403;

    public function render($request)
    {
        return response()->json([
            'error' => 'Account Not Linked',
            'message' => $this->message,
            'exception' => AccountNotLinkedException::class,
        ], $this->code);
    }

}