<?php
namespace App\Domains\Auth\Application\UseCases;

use App\Domains\Auth\Application\DTOs\UpdateProfileDTO;
use App\Domains\Auth\Domain\Models\User;
use App\Domains\Auth\Domain\Repositories\EmployeeRepositoryInterface;
use App\Domains\Auth\Domain\Repositories\UserRepositoryInterface;
use App\Domains\Auth\Http\Resources\UserResource;
use App\Domains\Shared\Domain\Services\AuditServiceInterface;
use App\Domains\Employee\Domain\Models\Employee;
use Illuminate\Support\Facades\DB;

class UpdateProfile
{
    public function __construct(
        protected EmployeeRepositoryInterface $employeeRepository,
        protected UserRepositoryInterface $userRepository,
        protected AuditServiceInterface $auditService
    ) {}

    public function execute(User $user, UpdateProfileDTO $dto): array
    {
        $employee = $user->employee;

        if (!$employee) {
            return [
                'status' => 'error',
                'message' => 'Employee record not found.'
            ];
        }

        // Capture old values for audit
        $oldValues = [
            'name' => $employee->name,
            'address' => $employee->address,
            'phone' => $employee->phone,
            'username' => $user->username,
        ];

        try {
            DB::beginTransaction();

            $employee->name = $dto->name;
            $employee->address = $dto->address ?: null;
            $employee->phone = $dto->phone ?: null;
            $this->employeeRepository->save($employee);

            $user->username = $dto->username;
            $this->userRepository->save($user);

            // Log the change
            $this->auditService->logDataChange(
                Employee::class,
                (string)$employee->id,
                $oldValues,
                [
                    'name' => $dto->name,
                    'address' => $employee->address,
                    'phone' => $employee->phone,
                    'username' => $dto->username,
                ],
                $employee->id
            );

            DB::commit();

            return [
                'status' => 'success',
                'message' => 'Profile updated successfully.',
                'data' => [
                    'user' => new UserResource($user->fresh())
                ]
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            return [
                'status' => 'error',
                'message' => 'Failed to update profile: ' . $e->getMessage()
            ];
        }
    }
}