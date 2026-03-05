<?php

namespace App\Domains\Auth\Infrastructure\Repositories;
use App\Domains\Auth\Domain\Models\User;

class UserRepository
{
    public function findByUsername(string $username): ?User
    {
        // We eager load relations here to keep the Use Case clean
        return User::with(['employee.role'])
            ->where('username', $username)
            ->first();
    }
}