<?php
namespace App\Domains\Auth\Application\UseCases;

use App\Domains\Auth\Domain\Models\User;
use App\Domains\Auth\Domain\Services\MailServiceInterface;
use Illuminate\Support\Facades\Log;

class SendVerificationCode
{
    protected $mailService;

    public function __construct(MailServiceInterface $mailService)
    {
        $this->mailService = $mailService;
    }

    public function execute(User $user): array
    {
        $employee = $user->employee;

        if (!$employee) {
            return [
                'status' => 'error',
                'message' => 'Employee record not found.'
            ];
        }

        // Generate a 6-digit code
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $employee->update([
            'verification_code' => $code
        ]);

        try {
            // Send the actual email
            $this->mailService->sendVerificationCode(
                $employee->email,
                $code,
                $employee->name
            );

            Log::info("Verification code sent to {$employee->email}");

            return [
                'status' => 'success',
                'message' => 'Verification code sent to ' . $employee->email,
            ];
        } catch (\Exception $e) {
            Log::error("Failed to send verification email to {$employee->email}: " . $e->getMessage());

            return [
                'status' => 'error',
                'message' => 'Failed to send verification code. Please try again later.'
            ];
        }
    }
}