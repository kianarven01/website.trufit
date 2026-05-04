<?php

namespace App\Domains\KeyManagement\Infrastructure\Repositories;

use App\Domains\KeyManagement\Domain\Models\RegistrationKey;
use Illuminate\Database\Eloquent\Collection;

class RegistrationKeyRepository
{
    public function getAll(string $status = 'all')
    {
        // Use Eager Loading to prevent N+1 queries
        $query = RegistrationKey::with(['employee.security', 'role']);

        if ($status === 'pending') {
            $query->where('is_used', false);
        } elseif ($status === 'used') {
            $query->where('is_used', true);
        }

        return $query->get();
    }

    public function create(array $data): RegistrationKey
    {
        return RegistrationKey::create([
            'first_name'    => $data['first_name'],
            'last_name'     => $data['last_name'],
            'email'         => $data['email'],
            'address'       => $data['address'],
            'phone'         => $data['phone'],
            'position'      => $data['position'],
            'key_code'      => $data['key_code'],
            'role_id'       => $data['role_id'], 
            'expires_at'    => $data['expires_at'],
            'is_used'       => false,
        ]);
    }

   public function getAllPending()
    {
        // Eager load role and security via employee relationship
        return RegistrationKey::with(['role', 'employee.security'])
            ->where('is_used', false)
            ->whereNull('employee_id') // Pending keys now have no employee record yet
            ->orderBy('created_at', 'desc')
            ->get();
    }
    public function findByCode(string $code) {
        return RegistrationKey::where('key_code', $code)->first();
    }

    public function markAsUsed(int $id) {
        return RegistrationKey::where('id', $id)->update(['is_used' => true]);
    }
}