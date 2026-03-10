<?php
namespace App\Domains\Auth\Application\UseCases;

use App\Domains\Auth\Domain\Services\MailServiceInterface;
use App\Domains\Employee\Domain\Models\Employee;
use Illuminate\Support\Facades\Log;

class ForgotPassword
{
    protected $mailService;

    public function __construct(MailServiceInterface $mailService)
    {
        $this->mailService = $mailService;
    }

    public function execute(string $email): array
    {
        $employee = Employee::where('email', $email)->first();

        if (!$employee) {
            return [
                'status' => 'error',
                'message' => 'We could not find an account with that email address.'
            ];
        }

        if (!$employee->hasVerifiedEmail()) {
            return [
                'status' => 'unverified',
                'message' => 'Your email is not verified. Please contact your administrator for assistance.'
            ];
        }

        // Generate a 6-digit reset code
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        $employee->update([
            'password_reset_code' => $code
        ]);

        try {
            $this->mailService->sendVerificationCode($employee->email, $code, $employee->name);
            Log::info("Password reset code sent to {$employee->email}");

            return [
                'status' => 'success',
                'message' => 'A password reset code has been sent to your email.'
            ];
        } catch (\Exception $e) {
            Log::error("Failed to send password reset email to {$employee->email}: " . $e->getMessage());
            return [
                'status' => 'error',
                'message' => 'Failed to send password reset code. Please try again later.'
            ];
        }
    }
}