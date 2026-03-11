<?php

namespace App\Domains\KeyManagement\Application\UseCases;

use App\Domains\KeyManagement\Application\DTOs\CompleteRegistrationDTO;
use App\Domains\KeyManagement\Infrastructure\Repositories\RegistrationKeyRepository;
use App\Domains\Employee\Domain\Models\Employee;
use App\Domains\Employee\Domain\Models\EmployeeSecurity;
use App\Domains\Auth\Domain\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CompleteRegistration
{
    public function __construct(
        protected RegistrationKeyRepository $keyRepository
    ) {}

    public function execute(CompleteRegistrationDTO $dto): void
    {
        DB::transaction(function () use ($dto) {
            // 1. Find and consume the key
            $keyRecord = $this->keyRepository->findByCode($dto->key_code);

            if (!$keyRecord || $keyRecord->is_used || $keyRecord->expires_at->isPast()) {
                throw new \Exception("Registration key is invalid, already used, or expired.");
            }

            // 2. Generate a unique 8-digit random ID
            do {
                $randomId = rand(10000000, 99999999);
            } while (Employee::where('id', $randomId)->exists());

            // 3. Create the Employee record
            $employee = Employee::create([
                'id' => $randomId,
                'name' => $keyRecord->employee_name,
                'email' => $keyRecord->email,
                'address' => $keyRecord->address,
                'phone' => $keyRecord->phone,
                'position' => $keyRecord->position,
                'roleID' => $keyRecord->role_id,
                'status' => true,
                'join_date' => now(),
            ]);

            // 3. Create the Security record (Unverified: User must verify in Account Settings later)
            EmployeeSecurity::create([
                'employee_id' => $employee->id,
                'email_verified_at' => null,
                'failed_login_attempts' => 0,
            ]);

            // 4. Create the Login Credentials
            User::create([
                'employeeID'    => $employee->id,
                'username'      => $dto->username,
                'password_hash' => Hash::make($dto->password),
            ]);

            // 5. Burn the key
            $keyRecord->update([
                'is_used' => true,
                'employee_id' => $employee->id // Link the key to the newly created employee for audit
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
