<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\RegistrationKey;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $fields = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string'
        ]);

        $user = User::with('employee.role')->where('username', $fields['username'])->first();

        if (!$user || !Hash::check($fields['password'], $user->password_hash)) {
            return response()->json([
                'status' => 'error',
                'message' => 'The username or password you entered is incorrect.'
            ], 401);
        }

        $token = $user->createToken('trufit_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Login successful',
            'data' => [
                'user' => $user,
                'token' => $token,
                'role' => $user->employee->role->name ?? 'staff'
            ]
        ], 200);
    }

    public function register(Request $request)
    {
        $fields = $request->validate([
            'username' => [
                'required',
                'string',
                Rule::unique(User::class, 'username'),
            ],
            'password' => 'required|string',
            'role_id'  => 'required|integer',
            'key_code' => 'required|string'
        ]);

        $key = RegistrationKey::where('key_code', $fields['key_code'])
            ->where('is_used', false)
            ->first();

        if (!$key) {
            return response()->json(['message' => 'Invalid key'], 422);
        }

        // Insert into Main.UserCredentials
        $user = User::create([
            'username' => $fields['username'],
            'password_hash' => Hash::make($fields['password']),
            // Link this to the employeeID assigned to the key
            'employeeID' => $key->employee_id
        ]);

        $key->update(['is_used' => true]);

        return response()->json(['status' => 'success'], 201);
    }
}
