<?php

namespace App\Domains\Employee\Infrastructure\Repositories;

use Illuminate\Database\Eloquent\Collection;
use App\Domains\Employee\Domain\Models\Employee;

class EmployeeRepository
{
    public function getAllActive(): Collection
        {
            // 'role' refers to the relationship method name in your Employee model
            return Employee::with('role')->get(); 
        }
}

