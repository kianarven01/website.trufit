<?php

namespace App\Domains\KeyManagement\Application\UseCases;

use App\Domains\KeyManagement\Domain\Models\RegistrationKey;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class VerifyRegistrationKey
{
    public function execute(string $keyCode)
    {
        $keyRecord = RegistrationKey::where('key_code', $keyCode)
            ->where('is_used', false)
            ->where('expires_at', '>', now())
            ->with('employee')
            ->first();

        if (!$keyRecord) {
            throw new ModelNotFoundException("Invalid or expired registration key.");
        }

        return $keyRecord;
    }
}