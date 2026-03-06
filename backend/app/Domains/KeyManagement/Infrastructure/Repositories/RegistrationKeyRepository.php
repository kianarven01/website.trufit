<?php

namespace App\Domains\KeyManagement\Infrastructure\Repositories;

use App\Domains\KeyManagement\Domain\Models\RegistrationKey;
use Illuminate\Database\Eloquent\Collection;

class RegistrationKeyRepository
{
    public function getAll(): Collection
    {
        return RegistrationKey::with('employee')
            ->orderBy('created_at', 'desc')
            ->get();
    }
    // used in LoginPage to verify logic
    public function findByCode(string $code)
    {
        return RegistrationKey::where('key_code', $code)
            ->where('is_used', false)
            ->first();
    }


}