<?php
namespace App\Domains\Auth\Application\UseCases;

use App\Domains\Auth\Application\DTOs\UpdateProfileDTO;
use App\Domains\Auth\Domain\Models\User;
use App\Domains\Auth\Domain\Repositories\EmployeeRepositoryInterface;
use App\Domains\Auth\Domain\Repositories\UserRepositoryInterface;
use App\Domains\Auth\Http\Resources\UserResource;
use Illuminate\Support\Facades\DB;

class UpdateProfile
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

    public function execute(User $user, UpdateProfileDTO $dto): array
    {
        $employee = $user->employee;

        if (!$employee) {
            return [
                'status' => 'error',
                'message' => 'Employee record not found.'
            ];
        }

        try {
            DB::beginTransaction();

            $employee->name = $dto->name;
            $employee->address = $dto->address ?? $employee->address;
            $employee->phone = $dto->phone ?? $employee->phone;
            $this->employeeRepository->save($employee);

            $user->username = $dto->username;
            $this->userRepository->save($user);

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