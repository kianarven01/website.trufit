<?php
namespace App\Domains\Auth\Application\UseCases;

use App\Domains\Auth\Domain\Services\MailServiceInterface;
use App\Domains\Auth\Domain\Repositories\EmployeeRepositoryInterface;
use App\Domains\Auth\Exceptions\AccountNotFoundException;
use App\Domains\Auth\Exceptions\UnverifiedAccountException;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ForgotPassword
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

    public function execute(string $email): array
    {
        $employee = $this->employeeRepository->findByEmail($email);

        if (!$employee) {
            throw new AccountNotFoundException('We could not find an account with that email address.');
        }

        if (!$employee->hasVerifiedEmail()) {
            throw new UnverifiedAccountException('Your email is not verified. Please contact your administrator for assistance.');
        }

        $security = $employee->security()->firstOrCreate(['employee_id' => $employee->id]);

        // Check if a valid code already exists (e.g., has > 5 mins left)
        $existingCode = $security->password_reset_code;
        $isStillValid = $security->password_reset_expires_at && Carbon::now()->addMinutes(5)->lt($security->password_reset_expires_at);

        if ($existingCode && $isStillValid) {
            $code = $existingCode;
        } else {
            // Generate new code only if none exists or it's near expiry
            $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            $security->password_reset_code = $code;
            $security->password_reset_expires_at = Carbon::now()->addMinutes(15);
            $security->save();
        }

        try {
            $employeeName = trim($employee->first_name . ' ' . $employee->last_name);
            $this->mailService->sendVerificationCode($employee->email, $code, $employeeName);
            return [
                'status' => 'success',
                'message' => 'A password reset code has been sent to your email.'
            ];
        } catch (\Exception $e) {
            Log::error("Failed to send password reset email: " . $e->getMessage());
            return [
                'status' => 'error',
                'message' => 'Failed to send password reset code. Please try again later.'
            ];
        }
    }
}