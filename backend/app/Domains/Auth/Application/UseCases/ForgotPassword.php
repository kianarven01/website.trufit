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

        // Generate a 6-digit reset code and expiry (15 minutes)
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        $employee->password_reset_code = $code;
        $employee->password_reset_expires_at = Carbon::now()->addMinutes(15);
        $this->employeeRepository->save($employee);

        try {
            $this->mailService->sendVerificationCode($employee->email, $code, $employee->name);
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