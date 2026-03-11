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
    public function __construct(
        protected UserRepository $userRepo,
        protected SendVerificationCode $sendVerificationCode
    ) {}

    public function execute(LoginDTO $dto): array
    {
        // Fetch User 
        $user = $this->userRepo->findByUsername($dto->username);
        
        if (!$user) {
            throw new InvalidCredentialsException();
        }

        $employee = $user->employee;
        if (!$employee) {
            throw new AccountNotLinkedException();
        }

        // Get or create security record
        $security = $employee->security()->firstOrCreate(['employee_id' => $employee->id]);

        // 1. Check if account is currently hit the failure threshold (5+ attempts)
        if ($security->failed_login_attempts >= 5) {
            
            // If email IS verified, give them the "Savior" (Identity Challenge)
            if ($employee->hasVerifiedEmail()) {
                // Trigger a verification code to the owner's email
                $this->sendVerificationCode->execute($user);
                
                return [
                    'status' => 'requires_verification',
                    'message' => 'Too many failed attempts. A verification code has been sent to your registered email to prove your identity.',
                    'email' => $employee->email
                ];
            }

            // If email is NOT verified, they MUST wait for the timer
            if ($security->lockout_until) {
                if (now()->lt($security->lockout_until)) {
                    $minutesLeft = ceil(now()->diffInSeconds($security->lockout_until) / 60);
                    return [
                        'status' => 'account_locked',
                        'message' => "Too many failed attempts and your email is not verified. Please try again in {$minutesLeft} minute(s) or contact an administrator.",
                        'locked_until' => $security->lockout_until
                    ];
                } else {
                    // Lockout has expired! Self-heal
                    $security->failed_login_attempts = 0;
                    $security->lockout_until = null;
                    $security->save();
                }
            } else {
                // Set the lockout timer if not already set
                $security->lockout_until = now()->addMinutes(15);
                $security->save();
                return [
                    'status' => 'account_locked',
                    'message' => 'Too many failed login attempts. Since your email is not verified, you must wait 15 minutes before trying again.'
                ];
            }
        }

        // 2. Check if account has an existing lockout timer from a previous fail (even if attempts < 5 now)
        if ($security->lockout_until && now()->lt($security->lockout_until)) {
            $minutesLeft = ceil(now()->diffInSeconds($security->lockout_until) / 60);
            return [
                'status' => 'account_locked',
                'message' => "Account is temporarily locked. Please try again in {$minutesLeft} minute(s).",
                'locked_until' => $security->lockout_until
            ];
        }

        $expiration = $dto->remember ? now()->addDays(30) : now()->addHours(8);

        // 3. Validate Credentials
        $password = new Password($dto->password); 
        if (!$password->verify($user->password_hash)) {
            // Increment failed attempts
            $security->failed_login_attempts += 1;
            
            // Set lockout on the 5th failure
            if ($security->failed_login_attempts >= 5) {
                $security->lockout_until = now()->addMinutes(15);
            }
            
            $security->save();
            throw new InvalidCredentialsException();
        }

        // 3. Login Success: Reset everything immediately
        $security->failed_login_attempts = 0;
        $security->lockout_until = null;
        $security->save();

        // NOW it is safe to delete tokens
        $user->tokens()->delete(); 

        // Create the new session
        $tokenResult = $user->createToken('auth', ['*'], $expiration);
        $newToken = $tokenResult->plainTextToken;

        $roleName = $employee->role->name ?? 'User'; 

        return [
            'status' => 'success',
            'data' => $this->formatResult(
                $roleName, 
                new UserResource($user), 
                $newToken 
            )
        ];
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
