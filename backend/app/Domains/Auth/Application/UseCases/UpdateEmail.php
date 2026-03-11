<?php
namespace App\Domains\Auth\Application\UseCases;

use App\Domains\Auth\Domain\Models\User;
use App\Domains\Auth\Http\Resources\UserResource;

class UpdateEmail
{
    protected $sendVerificationCode;

    public function __construct(SendVerificationCode $sendVerificationCode)
    {
        $this->sendVerificationCode = $sendVerificationCode;
    }

    public function execute(User $user, string $newEmail): array
    {
        $employee = $user->employee;

        if (!$employee) {
            return [
                'status' => 'error',
                'message' => 'Employee record not found.'
            ];
        }

        $employee->update([
            'email' => $newEmail,
        ]);

        $security = $employee->security()->firstOrCreate(['employee_id' => $employee->id]);
        $security->update([
            'email_verified_at' => null,
            'email_verification_code' => null,
        ]);

        // Automatically trigger a new verification code send
        $this->sendVerificationCode->execute($user);

        return [
            'status' => 'success',
            'message' => 'Email updated successfully. Please verify your new email address.',
            'data' => [
                'user' => new UserResource($user->fresh())
            ]
        ];
    }
}
