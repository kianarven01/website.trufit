<?php

namespace App\Domains\KeyManagement\Application\UseCases;

use App\Domains\KeyManagement\Application\DTOs\CompleteRegistrationDTO;
use App\Domains\KeyManagement\Infrastructure\Repositories\RegistrationKeyRepository;
use App\Domains\Employee\Infrastructure\Repositories\EmployeeRepository;
use App\Domains\Auth\Domain\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;



class CompleteRegistration
{
    public function __construct(
        protected RegistrationKeyRepository $keyRepository,
        protected EmployeeRepository $employeeRepository
    ) {}

    public function execute(CompleteRegistrationDTO $dto): void
    {
        DB::transaction(function () use ($dto) {
            // Find and consume the key via Repository
            $keyRecord = $this->keyRepository->findByCode($dto->key_code);

            if (!$keyRecord || $keyRecord->is_used) {
                throw new \Exception("Registration key is invalid or already used.");
            }

            $this->keyRepository->markAsUsed($keyRecord->id);

            // Activate the Employee via Repository
            $this->employeeRepository->activateEmployee($keyRecord->employee_id);

            // Create Login Credentials
            // (Note: User/Auth is usually a core concern, so direct Model or an AuthRepository is fine)
            User::create([
                'employeeID'    => $keyRecord->employee_id,
                'username'      => $dto->username,
                'password_hash' => Hash::make($dto->password),
            ]);
        });
    }
}
    /*public function execute(CompleteRegistrationDTO $dto): void
    {
        DB::transaction(function () use ($dto) {
            // 1. Find and consume the key
            $keyRecord = RegistrationKey::where('key_code', $dto->key_code)
                ->where('is_used', false)
                ->firstOrFail();

            $keyRecord->update(['is_used' => true]);

            // 2. Activate the Employee
            $employee = Employee::findOrFail($keyRecord->employee_id);
            $employee->update([
                'status' => true,
                'join_date' => now()
            ]);

            // 3. Create Login Credentials
            User::create([
                'employeeID' => $employee->id,
                'username'    => $dto->username,
                'password_hash'    => Hash::make($dto->password),
            ]);
        });
    }*/
