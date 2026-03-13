<?php

namespace App\Domains\Auth\Domain\Repositories;

use App\Domains\Employee\Domain\Models\Employee;

interface EmployeeRepositoryInterface
{
    public function findByEmail(string $email): ?Employee;
    public function findById(int $id): ?Employee;
    public function save(Employee $employee): bool;
}