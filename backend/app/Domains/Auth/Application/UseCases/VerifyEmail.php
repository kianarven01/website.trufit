<?php
namespace App\Domains\Auth\Application\UseCases;

use App\Domains\Auth\Domain\Models\User;
use App\Domains\Auth\Http\Resources\UserResource;
use App\Domains\Auth\Domain\Repositories\EmployeeRepositoryInterface;
use App\Domains\Auth\Exceptions\AccountNotFoundException;
use App\Domains\Auth\Exceptions\InvalidVerificationCodeException;
use App\Domains\Auth\Exceptions\VerificationCodeExpiredException;
use Carbon\Carbon;

class VerifyEmail
{
    protected $employeeRepository;

    public function __construct(EmployeeRepositoryInterface $employeeRepository)
    {
        $this->employeeRepository = $employeeRepository;
    }

    public function execute(User $user, string $code): array
    {
        $employee = $user->employee;

        if (!$employee) {
            throw new AccountNotFoundException('Employee record not found.');
        }

        $security = $employee->security;

        if (!$security || $security->email_verification_code !== $code) {
            throw new InvalidVerificationCodeException();
        }

        if ($security->email_verification_expires_at && Carbon::now()->gt($security->email_verification_expires_at)) {
            throw new VerificationCodeExpiredException();
        }

        $security->email_verified_at = Carbon::now();
        $security->email_verification_code = null;
        $security->email_verification_expires_at = null;
        $security->save();

        return [
            'status' => 'success',
            'message' => 'Email verified successfully.',
            'data' => [
                'user' => new UserResource($user->fresh())
            ]
        ];
    }
}