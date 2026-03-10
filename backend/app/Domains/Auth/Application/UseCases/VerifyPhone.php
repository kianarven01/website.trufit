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

        if ($employee->phone_verification_code !== $code) {
            return [
                'status' => 'error',
                'message' => 'Invalid verification code.'
            ];
        }

        $employee->update([
            'phone_verified_at' => Carbon::now(),
            'phone_verification_code' => null,
        ]);

        return [
            'status' => 'success',
            'message' => 'Phone number verified successfully.',
            'data' => [
                'user' => new UserResource($user->fresh())
            ]
        ];
    }
}