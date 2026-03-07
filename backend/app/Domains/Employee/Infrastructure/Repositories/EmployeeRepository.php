<?php

namespace App\Domains\Employee\Infrastructure\Repositories;

use Illuminate\Database\Eloquent\Collection;
use App\Domains\Employee\Domain\Models\Employee;

class EmployeeRepository
{
    public function getAllActive()
    {
        // Only return employees where status is TRUE (Active)
        return Employee::where('status', true)
            ->orderBy('name', 'asc')
            ->get();
    }

    public function getActiveEmployees()
        {
            // Only fetch employees who have completed onboarding
            return Employee::where('status', true)->get();
        }
}

