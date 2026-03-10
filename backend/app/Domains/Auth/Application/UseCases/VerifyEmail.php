<?php
namespace App\Domains\Auth\Application\UseCases;

use Illuminate\Http\Request;
use App\Domains\Auth\Http\Resources\UserResource;
use Carbon\Carbon;

class VerifyEmail
{
    public function execute(Request $request): array
    {
        $user = $request->user();
        $employee = $user->employee;

        if (!$employee) {
            return [
                'status' => 'error',
                'message' => 'Employee record not found.'
            ];
        }

        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        if ($employee->verification_code !== $request->code) {
            return [
                'status' => 'error',
                'message' => 'Invalid verification code.'
            ];
        }

        $employee->update([
            'email_verified_at' => Carbon::now(),
            'verification_code' => null,
        ]);

        return [
            'status' => 'success',
            'message' => 'Email verified successfully.',
            'data' => [
                'user' => new UserResource($user->fresh())
            ]
        ];
    }
}