<?php
namespace App\Domains\Auth\Application\UseCases;

use Illuminate\Http\Request;
use App\Domains\Auth\Http\Resources\UserResource;

class UpdateEmail
{
    protected $sendVerificationCode;
    protected $table = 'Main.Employees';

    public function __construct(SendVerificationCode $sendVerificationCode)
    {
        $this->sendVerificationCode = $sendVerificationCode;
    }

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
            'email' => 'required|email|max:255|unique:Employees,email,' . $employee->id,
        ]);

        $employee->update([
            'email' => $request->email,
            'email_verified_at' => null,
            'verification_code' => null,
        ]);

        // Automatically trigger a new verification code send
        $this->sendVerificationCode->execute($request);

        return [
            'status' => 'success',
            'message' => 'Email updated successfully. Please verify your new email address.',
            'data' => [
                'user' => new UserResource($user->fresh())
            ]
        ];
    }
}