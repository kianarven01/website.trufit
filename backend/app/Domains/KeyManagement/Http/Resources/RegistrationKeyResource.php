<?php

namespace App\Domains\KeyManagement\Http\Resources;
use Illuminate\Http\Resources\Json\JsonResource;

class RegistrationKeyResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'            => $this->id,
            'first_name'    => $this->first_name ?? $this->employee->first_name ?? 'Unknown',
            'last_name'     => $this->last_name ?? $this->employee->last_name ?? '',
            'email'         => $this->email ?? $this->employee->email ?? 'Unknown',
            'key_code'      => $this->key_code,
            'is_used'       => (bool) $this->is_used,
            'status'        => $this->is_used ? 'used' : 'pending',
            'expires_at'    => $this->expires_at->format('n/j/Y'),
            'role_name'     => $this->role->name ?? 'N/A',
            'position'      => $this->position ?? $this->employee->position ?? 'N/A',
        ];
    }
}

