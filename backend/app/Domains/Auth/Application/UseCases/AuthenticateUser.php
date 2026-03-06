<?php

namespace App\Domains\Auth\Application\UseCases;

use App\Domains\Auth\Application\DTOs\LoginDTO;
use App\Domains\Auth\Domain\ValueObjects\Password;
use App\Domains\Auth\Http\Resources\UserResource;
use App\Domains\Auth\Infrastructure\Repositories\UserRepository;
use App\Domains\Auth\Exceptions\AccountNotLinkedException;
use App\Domains\Shared\Exceptions\InvalidCredentialsException;
use Exception;

class AuthenticateUser
{
    public function __construct(protected UserRepository $userRepo) {}

    public function execute(LoginDTO $dto): array
    {
        // Fetch User 
        $user = $this->userRepo->findByUsername($dto->username);
        $expiration = $dto->remember ? now()->addDays(30) : now()->addHours(8);
    

        // Validate Credentials FIRST (The Shield)
        $password = new Password($dto->password); 
        if (!$user || !$password->verify($user->password_hash)) {
            //throw ValidationException::withMessages(['username' => ['Invalid credentials.']]);
            throw new InvalidCredentialsException();
        }

        // Domain Guards (Check Links)
        if (!$user->employee) {
            throw new AccountNotLinkedException();
        }

        // NOW it is safe to delete tokens (The Sword)
        // We only reach this point if the password was CORRECT.
        $user->tokens()->delete(); 

        // Create the new session
        $tokenResult = $user->createToken('auth', ['*'], $expiration);
        $newToken = $tokenResult->plainTextToken;

        $roleName = $user->employee->role->name; 

        return $this->formatResult(
            $roleName, 
            new UserResource($user), 
            $newToken 
        );
    }

    private function formatResult(string $role, mixed $user, string $newToken): array
    {
        return [
            'user' => $user,
            'token' => $newToken,
            'role' => $role
        ];
    }
}
