<?php

namespace App\Domains\Auth\Application\UseCases;

use App\Domains\Auth\Application\DTOs\LoginDTO;
use App\Domains\Auth\Domain\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthenticateUser
{
    public function execute(LoginDTO $dto): array
    {
        // Super Admin Check
        if ($dto->username === env('SUPER_ADMIN_USERNAME') && 
            Hash::check($dto->password, env('SUPER_ADMIN_PASSWORD'))) {
            return $this->buildResponse('super_admin', $dto->username, 0);
        }

        // Standard Employee Check
        $user = User::where('username', $dto->username)->first();

        if (!$user || !Hash::check($dto->password, $user->password_hash)) {
            throw ValidationException::withMessages(['username' => 'Invalid credentials.']);
        }

        return $this->buildResponse('employee', $user->username, $user->employeeID, $user);
    }

    private function buildResponse(string $role, string $username, ?int $id, $user = null): array
    {
        return [
            'user' => [
                'username' => $username,
                'employeeID' => $id, 
                'name' => $username,
            ],
            // Authenticated Sanctum token for employees, static for SA
            'token' => $user ? $user->createToken('auth')->plainTextToken : 'SA_TOKEN_'.bin2hex(random_bytes(10)),
            'role' => $role
        ];
    }
}