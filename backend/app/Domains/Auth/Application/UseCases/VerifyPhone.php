<?php
namespace App\Domains\Auth\Application\UseCases;

use App\Domains\Auth\Domain\Models\User;
use App\Domains\Auth\Http\Resources\UserResource;
use Carbon\Carbon;

class VerifyPhone
{
    public function execute(User $user, string $code): array
    {
        $employee = $user->employee;

        if (!$employee) {
            return [
                'status' => 'error',
                'message' => 'Employee record not found.'
            ];
        }

        $security = $employee->security;

        if (!$security || $security->phone_verification_code !== $code) {
            return [
                'status' => 'error',
                'message' => 'Invalid verification code.'
            ];
        }

        if ($security->phone_verification_expires_at && Carbon::now()->gt($security->phone_verification_expires_at)) {
            return [
                'status' => 'error',
                'message' => 'Verification code expired.'
            ];
        }

        $security->phone_verified_at = Carbon::now();
        $security->phone_verification_code = null;
        $security->phone_verification_expires_at = null;
        $security->save();

        return [
            'status' => 'success',
            'message' => 'Phone number verified successfully.',
            'data' => [
                'user' => new UserResource($user->fresh())
            ]
        ];
    }
}