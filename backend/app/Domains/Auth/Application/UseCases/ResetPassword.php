<?php
namespace App\Domains\Auth\Application\UseCases;

use App\Domains\Auth\Domain\Models\User;
use App\Domains\Auth\Domain\Repositories\EmployeeRepositoryInterface;
use App\Domains\Auth\Domain\Repositories\UserRepositoryInterface;
use App\Domains\Auth\Exceptions\AccountNotFoundException;
use App\Domains\Auth\Exceptions\InvalidVerificationCodeException;
use App\Domains\Auth\Exceptions\VerificationCodeExpiredException;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class ResetPassword
{
    protected $employeeRepository;
    protected $userRepository;

    public function __construct(
        EmployeeRepositoryInterface $employeeRepository,
        UserRepositoryInterface $userRepository
    ) {
        $this->employeeRepository = $employeeRepository;
        $this->userRepository = $userRepository;
    }

    public function execute(string $email, string $code, string $newPassword): array
    {
        $employee = $this->employeeRepository->findByEmail($email);

        if (!$employee) {
            throw new AccountNotFoundException('Employee record not found.');
        }

        if (!$employee->password_reset_code || $employee->password_reset_code !== $code) {
            throw new InvalidVerificationCodeException('Invalid reset code.');
        }

        if ($employee->password_reset_expires_at && Carbon::now()->gt($employee->password_reset_expires_at)) {
            throw new VerificationCodeExpiredException('The reset code has expired.');
        }

        $user = $this->userRepository->findByEmployeeId($employee->id);

        if (!$user) {
            throw new AccountNotFoundException('User account not found for this employee.');
        }

        $user->password_hash = Hash::make($newPassword);
        $this->userRepository->save($user);

        $employee->password_reset_code = null;
        $employee->password_reset_expires_at = null;
        $this->employeeRepository->save($employee);

        return [
            'status' => 'success',
            'message' => 'Your password has been reset successfully.'
        ];
    }
}