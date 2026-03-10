<?php
namespace App\Domains\Auth\Application\UseCases;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UpdatePassword
{
    public function execute(Request $request): array
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'required',
            'password' => 'required|min:8|confirmed',
        ]);

        if (!Hash::check($request->current_password, $user->getAuthPassword())) {
            return [
                'status' => 'error',
                'message' => 'The provided password does not match your current password.'
            ];
        }

        $user->update([
            'password_hash' => Hash::make($request->password),
        ]);

        return [
            'status' => 'success',
            'message' => 'Password updated successfully.'
        ];
    }
}