<?php

namespace App\Domains\Employee\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class OnboardingResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            // Try key record first, fall back to employee relationship for old records
            'employee_name' => $this->employee_name ?? $this->employee->name ?? 'Unknown Employee', 
            'email' => $this->email ?? $this->employee->email ?? 'N/A',
            'key_code' => $this->key_code,
            'is_used' => (bool)$this->is_used,
            'expires_at' => $this->expires_at ? $this->expires_at->toISOString() : null,
        ];
    }
}