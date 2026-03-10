<?php

namespace App\Domains\Auth\Domain\Repositories;

use App\Domains\Auth\Domain\Models\User;

interface UserRepositoryInterface
{
    public function findByEmployeeId(int $employeeId): ?User;
    public function save(User $user): bool;
}