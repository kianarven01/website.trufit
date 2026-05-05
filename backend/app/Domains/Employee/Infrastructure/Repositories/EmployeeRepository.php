<?php

namespace App\Domains\Employee\Infrastructure\Repositories;

use Illuminate\Database\Eloquent\Collection;
use App\Domains\Employee\Domain\Models\Employee;

class EmployeeRepository
{
    public function getAllActive()
    {
        // Use Eager Loading to prevent N+1 on security relationship
        return Employee::with(['security', 'role'])
            ->where('status', true)
            ->orderBy('last_name', 'asc')
            ->orderBy('first_name', 'asc')
            ->get();
    }

    public function getActiveEmployees()
    {
        return Employee::with(['security', 'role'])
            ->where('status', true)
            ->get();
    }

    public function activateEmployee(int $id) {
    return Employee::where('id', $id)->update([
        'status' => true,
        'join_date' => now()
    ]);
}
}

