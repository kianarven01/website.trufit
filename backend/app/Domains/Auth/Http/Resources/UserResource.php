<?php

namespace App\Domains\Auth\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

//for returning user data after login, registration, or fetching user details
class UserResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'username' => $this->username,
            'employeeID' => $this->employeeID,
            'name' => $this->employee->name ?? $this->username,
            'email' => $this->employee->email ?? null,
            'email_verified_at' => $this->employee->email_verified_at ?? null,
            'is_verified' => $this->employee ? $this->employee->hasVerifiedEmail() : false,
            'phone' => $this->employee->phone ?? null,
            'phone_verified_at' => $this->employee->phone_verified_at ?? null,
            'is_phone_verified' => $this->employee ? $this->employee->hasVerifiedPhone() : false,
            'address' => $this->employee->address ?? null,
            'position' => $this->employee->position ?? null,
            'role' => $this->employee->role->name ?? 'User',
            'permissions' => $this->employee->role->permissions ?? [], // Future-proof
        ];
    }

}