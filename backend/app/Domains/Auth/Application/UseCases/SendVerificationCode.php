<?php
namespace App\Domains\Auth\Application\UseCases;

use App\Domains\Auth\Domain\Models\User;
use App\Domains\Auth\Domain\Services\MailServiceInterface;
use App\Domains\Auth\Domain\Repositories\EmployeeRepositoryInterface;
use App\Domains\Auth\Exceptions\AccountNotFoundException;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class SendVerificationCode
{
    protected $mailService;
    protected $employeeRepository;

    public function __construct(
        MailServiceInterface $mailService,
        EmployeeRepositoryInterface $employeeRepository
    ) {
        $this->mailService = $mailService;
        $this->employeeRepository = $employeeRepository;
    }

    public function execute(User $user): array
    {
        $employee = $user->employee;

        if (!$employee) {
            throw new AccountNotFoundException('Employee record not found.');
        }

        $security = $employee->security()->firstOrCreate(['employee_id' => $employee->id]);

        // Check if a valid code already exists (e.g., has > 3 mins left)
        $existingCode = $security->email_verification_code;
        $isStillValid = $security->email_verification_expires_at && Carbon::now()->addMinutes(3)->lt($security->email_verification_expires_at);

        if ($existingCode && $isStillValid) {
            $code = $existingCode;
        } else {
            // Generate code and expiry (10 minutes)
            $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            $expiresAt = Carbon::now()->addMinutes(10);

            $security->email_verification_code = $code;
            $security->email_verification_expires_at = $expiresAt;
            $security->save();
        }

        try {
            $this->mailService->sendVerificationCode($employee->email, $code, $employee->name);            return [
                'status' => 'success',
                'message' => 'Verification code sent to ' . $employee->email,
            ];
        } catch (\Exception $e) {
            Log::error("Failed to send verification email: " . $e->getMessage());
            return [
                'status' => 'error',
                'message' => 'Failed to send verification code. Please try again later.'
            ];
        }
    }
}