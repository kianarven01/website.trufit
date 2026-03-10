<?php
namespace App\Domains\Auth\Application\UseCases;

use App\Domains\Auth\Domain\Models\User;
use App\Domains\Employee\Domain\Models\Employee;
use Illuminate\Support\Facades\Hash;

class ResetPassword
{

    public function execute(string $email, string $code, string $newPassword): array
    {

        $employee = Employee::where('email', $email)->first();

        if (!$employee) {
            return [
                'status' => 'error',
                'message' => 'Employee record not found.'
            ];
        }

        if (!$employee->password_reset_code || $employee->password_reset_code !== $code) {
            return [
                'status' => 'error',
                'message' => 'Invalid or expired reset code.'
            ];
        }

        $user = User::where('employeeID', $employee->id)->first();

        if (!$user) {
            return [
                'status' => 'error',
                'message' => 'User account not found for this employee.'
            ];
        }

        $user->update([
            'password_hash' => Hash::make($newPassword),
        ]);

        $employee->update([
            'password_reset_code' => null,
        ]);

        return [
            'status' => 'success',
            'message' => 'Your password has been reset successfully.'
        ];
    }
}