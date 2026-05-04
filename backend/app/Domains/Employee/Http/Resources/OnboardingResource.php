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
            'first_name' => $this->first_name ?? $this->employee->first_name ?? 'Unknown',
            'last_name' => $this->last_name ?? $this->employee->last_name ?? '',
            'email' => $this->email ?? $this->employee->email ?? 'N/A',
            'key_code' => $this->key_code,
            'is_used' => (bool)$this->is_used,
            'expires_at' => $this->expires_at ? $this->expires_at->toISOString() : null,
        ];
    }
}