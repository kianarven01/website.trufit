<?php
namespace App\Domains\Auth\Application\UseCases;

use App\Domains\Auth\Domain\Models\User;
use App\Domains\Auth\Domain\Services\SmsServiceInterface;
use Illuminate\Support\Facades\Log;

class SendPhoneVerificationCode
{
    protected $smsService;

    public function __construct(SmsServiceInterface $smsService)
    {
        $this->smsService = $smsService;
    }

    public function execute(User $user): array
    {
        $employee = $user->employee;

        if (!$employee || !$employee->phone) {
            return [
                'status' => 'error',
                'message' => 'Employee record or phone number not found.'
            ];
        }

        // Generate a 6-digit code
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        $employee->update([
            'phone_verification_code' => $code
        ]);

        try {
            $this->smsService->sendVerificationCode($employee->phone, $code);
            Log::info("Phone verification code sent to {$employee->phone}");

            return [
                'status' => 'success',
                'message' => 'Verification code sent via SMS.'
            ];
        } catch (\Exception $e) {
            Log::error("Failed to send SMS to {$employee->phone}: " . $e->getMessage());
            return [
                'status' => 'error',
                'message' => 'Failed to send verification SMS.'
            ];
        }
    }
}