<?php

namespace App\Domains\Employee\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
{
    public function toArray($request)
    {
        return [
        'id' => $this->id,
        'name' => $this->name,
        'email' => $this->email,
        'position' => $this->position,
        'role_name' => $this->role->name ?? 'Unassigned', 
        'join_date' => $this->join_date, 
        'address' => $this->address,
        'status' => (bool) $this->status,
        ];
    }
}