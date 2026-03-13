<?php

namespace App\Domains\Auth\Infrastructure\Repositories;

use App\Domains\Auth\Domain\Repositories\UserRepositoryInterface;
use App\Domains\Auth\Domain\Models\User;

class EloquentUserRepository implements UserRepositoryInterface
{
    public function findByEmployeeId(int $employeeId): ?User
    {
        return User::where('employeeID', $employeeId)->first();
    }

    public function save(User $user): bool
    {
        return $user->save();
    }
}