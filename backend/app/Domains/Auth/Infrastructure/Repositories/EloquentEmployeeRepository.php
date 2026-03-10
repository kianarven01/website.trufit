<?php

namespace App\Domains\Auth\Infrastructure\Repositories;

use App\Domains\Auth\Domain\Repositories\EmployeeRepositoryInterface;
use App\Domains\Employee\Domain\Models\Employee;

class EloquentEmployeeRepository implements EmployeeRepositoryInterface
{
    public function findByEmail(string $email): ?Employee
    {
        return Employee::where('email', $email)->first();
    }

    public function findById(int $id): ?Employee
    {
        return Employee::find($id);
    }

    public function save(Employee $employee): bool
    {
        return $employee->save();
    }
}