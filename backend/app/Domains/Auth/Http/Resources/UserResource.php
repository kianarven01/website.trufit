<?php

namespace App\Domains\Auth\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

//for returning user data after login, registration, or fetching user details
class UserResource extends JsonResource
{
    public function toArray($request)
    {
        $address = null;
        $phone = null;

        try {
            $address = $this->employee->address ?? null;
            $phone = $this->employee->phone ?? null;
        } catch (\Exception $e) {
            // Decryption failed, likely legacy plain-text data
            // We return null or the raw value if your policy allows
            $address = "Decryption Error"; 
            $phone = "Decryption Error";
        }

        return [
            'username' => $this->username,
            'employeeID' => $this->employeeID,
            'name' => $this->employee->name ?? $this->username,
            'email' => $this->employee->email ?? null,
            'email_verified_at' => $this->employee->security->email_verified_at ?? null,
            'is_verified' => $this->employee ? $this->employee->hasVerifiedEmail() : false,
            'phone' => $phone,
            'phone_verified_at' => $this->employee->security->phone_verified_at ?? null,
            'is_phone_verified' => $this->employee ? $this->employee->hasVerifiedPhone() : false,
            'address' => $address,
            'position' => $this->employee->position ?? null,
            'role' => $this->employee->role->name ?? 'User',
            'permissions' => $this->employee->role->permissions ?? [], // Future-proof
        ];
    }

}