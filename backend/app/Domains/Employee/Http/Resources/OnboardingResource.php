<?php

namespace App\Domains\Employee\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class OnboardingResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            // Reach into the employee relationship to get the name and email
            'employee_name' => $this->employee->name ?? 'Unknown Employee', 
            'email' => $this->employee->email ?? 'N/A',
            
            'key_code' => $this->key_code, //
            'is_used' => (bool)$this->is_used, //
            
            // Format for the frontend expiry logic
            'expires_at' => $this->expires_at ? $this->expires_at->toISOString() : null,
        ];
    }
}