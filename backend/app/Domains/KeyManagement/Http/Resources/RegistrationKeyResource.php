<?php

namespace App\Domains\KeyManagement\Http\Resources;
use Illuminate\Http\Resources\Json\JsonResource;

class RegistrationKeyResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'            => $this->id,
            'employee_name' => $this->employee->name ?? 'Unknown',
            'email'         => $this->employee->email ?? 'Unknown',
            'key_code'      => $this->key_code,
            'is_used'       => (bool) $this->is_used, // Crucial for your status logic
            'status'        => $this->is_used ? 'used' : 'pending',
            'expires_at'    => $this->expires_at->format('n/j/Y'), // Matches Onboarding UI format
            'role_name'     => $this->role->name ?? 'N/A',
            'position'      => $this->employee->position ?? 'N/A', // Needed for LoginPage verification
        ];
    }
}

