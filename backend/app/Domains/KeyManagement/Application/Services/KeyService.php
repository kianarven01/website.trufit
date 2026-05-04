<?php

namespace App\Domains\KeyManagement\Application\Services;

use Illuminate\Support\Facades\DB;
use App\Domains\KeyManagement\Infrastructure\Repositories\RegistrationKeyRepository;
use App\Domains\KeyManagement\Domain\Models\RegistrationKey;
use App\Domains\Employee\Domain\Models\Employee;
use Illuminate\Support\Str;

use App\Domains\Auth\Domain\Services\MailServiceInterface;

use App\Domains\Shared\Domain\Services\AuditServiceInterface;

class KeyService
//for key generation and employee ID generation
{
    public function __construct(
        protected RegistrationKeyRepository $repository,
        protected MailServiceInterface $mailService,
        protected AuditServiceInterface $auditService
    ) {}

    public function generateForNewEmployee($dto): string
    {
        return DB::transaction(function () use ($dto) {
            // 1. Generate Key
            $keyCode = 'TRUFIT-' . strtoupper(Str::random(6));

            // 2. Save Key via Repository
            $key = $this->repository->create([
                'first_name'    => $dto->firstName,
                'last_name'     => $dto->lastName,
                'email'         => $dto->email,
                'address'       => $dto->address,
                'phone'         => $dto->phone,
                'position'      => $dto->position,
                'role_id'       => $dto->roleId,
                'key_code'      => $keyCode,
                'expires_at'    => now()->addDays(7)
            ]);

            $employeeName = "{$dto->firstName} {$dto->lastName}";

            // 3. Audit the action
            $this->auditService->log(
                'ONBOARDING', 
                'KEY_GENERATED', 
                null, 
                RegistrationKey::class, 
                (string)$key->id,
                null,
                ['employee_name' => $employeeName, 'email' => $dto->email]
            );
            // 4. Send Email
            $this->mailService->sendRegistrationKey($dto->email, $keyCode, $employeeName);

            return $keyCode;
        });
    }

    public function regenerateKey($id)
    {
        return DB::transaction(function () use ($id) {
            $registrationKey = RegistrationKey::findOrFail($id);

            $oldCode = $registrationKey->key_code;

            // 1. Generate a fresh code
            $newCode = 'TRUFIT-' . strtoupper(Str::random(6));

            // 2. Update the record
            $registrationKey->update([
                'key_code' => $newCode,
                'expires_at' => now()->addDays(7)
            ]);

            // 3. Audit the action
            $this->auditService->log(
                'ONBOARDING', 
                'KEY_REGENERATED', 
                null, 
                RegistrationKey::class, 
                (string)$id,
                ['key_code' => $oldCode],
                ['key_code' => $newCode]
            );

             // 4. Send Email
             $employeeName = trim($registrationKey->first_name . ' ' . $registrationKey->last_name);
             $this->mailService->sendRegistrationKey($registrationKey->email, $newCode, $employeeName);

            return $newCode;
        });
    }
}