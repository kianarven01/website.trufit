<?php
namespace App\Domains\Auth\Application\UseCases;

use App\Domains\Auth\Domain\Models\User;
use Illuminate\Support\Facades\Hash;

class UpdatePassword
{
    public function execute(User $user, string $currentPassword, string $newPassword): array
    {
        if (!Hash::check($currentPassword, $user->getAuthPassword())) {
            return [
                'status' => 'error',
                'message' => 'The provided password does not match your current password.'
            ];
        }

        $user->update([
            'password_hash' => Hash::make($newPassword),
        ]);

        return [
            'status' => 'success',
            'message' => 'Password updated successfully.'
        ];
    }
}