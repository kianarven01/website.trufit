<?php
namespace App\Domains\Auth\Application\UseCases;

use App\Domains\Auth\Domain\Models\User;
use App\Domains\Auth\Exceptions\InvalidVerificationCodeException;
use App\Domains\Auth\Exceptions\VerificationCodeExpiredException;
use Carbon\Carbon;

use App\Domains\Auth\Http\Resources\UserResource;

class VerifyLoginChallenge
{
    public function execute(string $username, string $code, bool $remember = false): array
    {
        $user = User::where('username', $username)->first();

        if (!$user || !$user->employee) {
            throw new InvalidVerificationCodeException('Account not found.');
        }

        $employee = $user->employee;
        $security = $employee->security;

        if (!$security || $security->email_verification_code !== $code) {
            throw new InvalidVerificationCodeException();
        }

        if ($security->email_verification_expires_at && Carbon::now()->gt($security->email_verification_expires_at)) {
            throw new VerificationCodeExpiredException();
        }

        // Challenge Passed: Reset everything immediately
        $security->failed_login_attempts = 0;
        $security->lockout_until = null; // Fix: Explicitly clear the timer here too
        
        // "Promote" this code to a password reset code
        $security->password_reset_code = $security->email_verification_code;
        $security->password_reset_expires_at = Carbon::now()->addMinutes(15);
        
        // Clear the challenge fields
        $security->email_verification_code = null;
        $security->email_verification_expires_at = null;
        
        $security->save();

        // Create a real session token
        $expiration = $remember ? now()->addDays(30) : now()->addHours(8);
        $user->tokens()->delete(); 
        $tokenResult = $user->createToken('auth', ['*'], $expiration);

        return [
            'status' => 'success',
            'message' => 'Identity verified! You can now access your dashboard or reset your password.',
            'can_reset' => true,
            'recovery_code' => $code,
            'auth_payload' => [
                'user' => new UserResource($user),
                'token' => $tokenResult->plainTextToken,
                'role' => $employee->role->name ?? 'User'
            ]
        ];
    }
}