<?php

namespace App\Domains\Auth\Application\UseCases;

use App\Domains\Auth\Application\DTOs\LoginDTO;
use App\Domains\Auth\Domain\ValueObjects\Password;
use App\Domains\Auth\Http\Resources\UserResource;
use App\Domains\Auth\Infrastructure\Repositories\UserRepository;
use App\Domains\Auth\Domain\Exceptions\AccountNotLinkedException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Exception;

class AuthenticateUser
{
    public function __construct(protected UserRepository $userRepo) {}

    public function execute(LoginDTO $dto): array
    {
        $password = new Password($dto->password); 

        // Super Admin Check with Password Verification
        if ($dto->username === env('SUPER_ADMIN_USERNAME')) {
            // Securely check the password against the env hash
            if (!Hash::check($dto->password, env('SUPER_ADMIN_PASSWORD'))) {
                throw ValidationException::withMessages(['username' => 'Invalid credentials.']);
            }

             return $this->formatResult('super_admin', [
                 'username' => $dto->username,
                 'employeeID' => 0,
                 'name' => 'System Admin'
             ], 'SA_TOKEN_' . bin2hex(random_bytes(10)));
        }

        // Fetch User via Repository (Eager loads employee and role)
        $user = $this->userRepo->findByUsername($dto->username);

        // Credential Validation
        if (!$user || !$password->verify($user->password_hash)) {
            throw ValidationException::withMessages(['username' => ['Invalid credentials.']]);
        }

        // Domain Guards (Checking the links in the chain)
        if (!$user->employee) {
            //throw new Exception("Account Error: User not linked to an Employee record.");
            throw new AccountNotLinkedException();
        }

        if (!$user->employee->role) {
            throw new Exception("RBAC Error: Employee has no assigned Role in the database.");
        }

        // DYNAMIC ROLE: Pull name directly from DB instead of Enum
        // This allows your Role CRUD to work without code changes
        $roleName = $user->employee->role->name; 

        return $this->formatResult(
            $roleName, 
            new UserResource($user), 
            $user->createToken('auth')->plainTextToken
        );
    }

    private function formatResult(string $role, mixed $user, string $token): array
    {
        return [
            'user' => $user,
            'token' => $token,
            'role' => $role
        ];
    }
}