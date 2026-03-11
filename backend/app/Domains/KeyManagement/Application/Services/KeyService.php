<?php

namespace App\Domains\KeyManagement\Application\Services;

use Illuminate\Support\Facades\DB;
use App\Domains\KeyManagement\Infrastructure\Repositories\RegistrationKeyRepository;
use App\Domains\KeyManagement\Domain\Models\RegistrationKey;
use App\Domains\Employee\Domain\Models\Employee;
use Illuminate\Support\Str;

use App\Domains\Auth\Domain\Services\MailServiceInterface;

class KeyService
//for key generation and employee ID generation
{
    public function __construct(
        protected RegistrationKeyRepository $repository,
        protected MailServiceInterface $mailService
    ) {}

    public function generateForNewEmployee($dto): string
    {
        // 1. Generate Key
        $keyCode = 'TRUFIT-' . strtoupper(Str::random(6));
        $employeeName = "{$dto->firstName} {$dto->lastName}";

        // 2. Save Key via Repository
        $this->repository->create([
            'employee_name' => $employeeName,
            'email'         => $dto->email,
            'address'       => $dto->address,
            'phone'         => $dto->phone,
            'position'      => $dto->position,
            'role_id'       => $dto->roleId,
            'key_code'      => $keyCode,
            'expires_at'    => now()->addDays(7)
        ]);

        // 3. Send Email
        $this->mailService->sendRegistrationKey($dto->email, $keyCode, $employeeName);

        return $keyCode;
    }

    public function regenerateKey($id)
    {
        return DB::transaction(function () use ($id) {
            $registrationKey = RegistrationKey::findOrFail($id);

            // 1. Generate a fresh code
            $newCode = 'TRUFIT-' . strtoupper(Str::random(6));

            // 2. Update the record
            $registrationKey->update([
                'key_code' => $newCode,
                'expires_at' => now()->addDays(7)
            ]);

             // 3. Send Email
             $this->mailService->sendRegistrationKey($registrationKey->email, $newCode, $registrationKey->employee_name);

            return $newCode;
        });
    }
}