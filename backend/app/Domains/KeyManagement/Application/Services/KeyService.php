<?php

namespace App\Domains\KeyManagement\Application\Services;

use Illuminate\Support\Facades\DB;
use App\Domains\KeyManagement\Infrastructure\Repositories\RegistrationKeyRepository;
use App\Domains\KeyManagement\Domain\Models\RegistrationKey;
use App\Domains\Employee\Domain\Models\Employee;
use Illuminate\Support\Str;

class KeyService
//for key generation and employee ID generation
{
    public function __construct(protected RegistrationKeyRepository $repository) {}

    public function generateForNewEmployee($dto): string
    {
        return DB::transaction(function () use ($dto) {
            // 1. Generate 8-digit random ID
            $randomId = rand(10000000, 99999999);

            // 2. Create Employee
            $employee = Employee::create([
                'id'       => $randomId,
                'name'     => "{$dto->firstName} {$dto->lastName}",
                'email'    => $dto->email,
                'address'  => $dto->address,
                'phone'    => $dto->phone,
                'position' => $dto->position,
                'roleID'   => $dto->roleId, // Main.Employees column
                'status'   => false, 
            ]);

            // 3. Generate Key
            $keyCode = 'TRUFIT-' . strtoupper(Str::random(6));

            // 4. Save Key via Repository
            // If this fails, the Employee created above is deleted (rolled back)
            $this->repository->create([
                'employee_id' => $employee->id,
                'key_code'    => $keyCode,
                'role_id'     => $dto->roleId, // Main.RegistrationKeys column
                'expires_at'  => now()->addDays(7)
            ]);

            return $keyCode;
        });
    }

    public function regenerateKey($employeeId)
    {
        return DB::transaction(function () use ($employeeId) {
            $registrationKey = RegistrationKey::where('employee_id', $employeeId)
                ->where('is_used', false)
                ->firstOrFail();

            // 1. Generate a fresh code
            $newCode = 'TRUFIT-' . strtoupper(Str::random(6));

            // 2. Update the record (this triggers updated_at)
            $registrationKey->update([
                'key_code' => $newCode,
                'expires_at' => now()->addDays(7) // Reset the expiration timer
            ]);

             // 3. TODO: Trigger Email/SMS Service
             // $this->notificationService->send($registrationKey->employee, $newCode);


            return $newCode;
        });
    }
}