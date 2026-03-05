<?php

namespace App\Domains\Auth\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

//for returning user data after login, registration, or fetching user details
class UserResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'username' => $this->username,
            'employeeID' => $this->employeeID,
            'name' => $this->employee->name ?? $this->username,
        ];
    }
}