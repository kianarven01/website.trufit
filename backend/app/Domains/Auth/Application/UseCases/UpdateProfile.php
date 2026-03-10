<?php
namespace App\Domains\Auth\Application\UseCases;

use Illuminate\Http\Request;
use App\Domains\Auth\Http\Resources\UserResource;
use Illuminate\Support\Facades\DB;

class UpdateProfile
{
    protected $table = 'Main.UserCredentials';
    
    public function execute(Request $request): array
    {
        $user = $request->user();
        $employee = $user->employee;

        if (!$employee) {
            return [
                'status' => 'error',
                'message' => 'Employee record not found.'
            ];
        }

        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'username' => 'required|string|max:255|unique:UserCredentials,username,' . $user->id,
        ]);

        try {
            DB::beginTransaction();

            $employee->update([
                'name' => $validatedData['name'],
                'address' => $validatedData['address'] ?? $employee->address,
                'phone' => $validatedData['phone'] ?? $employee->phone,
            ]);

            $user->update([
                'username' => $validatedData['username'],
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