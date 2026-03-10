<?php
namespace App\Domains\Auth\Application\UseCases;

use App\Domains\Auth\Application\DTOs\UpdateProfileDTO;
use App\Domains\Auth\Domain\Models\User;
use App\Domains\Auth\Http\Resources\UserResource;
use Illuminate\Support\Facades\DB;

class UpdateProfile
{
    protected $table = 'Main.UserCredentials';
    
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

            $employee->update([
                'name' => $dto->name,
                'address' => $dto->address ?? $employee->address,
                'phone' => $dto->phone ?? $employee->phone,
            ]);

            $user->update([
                'username' => $dto->username,
            ]);

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