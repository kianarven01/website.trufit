<?php

namespace App\Domains\KeyManagement\Infrastructure\Repositories;

use App\Domains\KeyManagement\Domain\Models\RegistrationKey;
use Illuminate\Database\Eloquent\Collection;

class RegistrationKeyRepository
{
    public function getAll($status = 'all')
    {
        $query = RegistrationKey::with(['employee', 'role']);

        if ($status === 'pending') {
            $query->where('is_used', false);
        } elseif ($status === 'used') {
            $query->where('is_used', true);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    public function create(array $data)
    {
        return RegistrationKey::create([
            'employee_id' => $data['employee_id'],
            'key_code'    => $data['key_code'],
            'role_id'     => $data['role_id'], 
            'expires_at'  => $data['expires_at'],
            'is_used'     => false,
        ]);
    }

   public function getAllPending()
    {
        return RegistrationKey::with(['employee', 'role'])
            ->whereHas('employee', function ($query) {
                $query->where('status', false); // Only show those not yet active
            })
            ->where('is_used', false) // Only show unused keys
            ->orderBy('created_at', 'desc')
            ->get();
    }
}