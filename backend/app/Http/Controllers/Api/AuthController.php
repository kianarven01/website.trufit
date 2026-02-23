<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\RegistrationKey;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $fields = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string'
        ]);

        // Load the user WITH their role relationship
        $user = User::with('employee.role')->where('username', $fields['username'])->first();

        if (!$user || !Hash::check($fields['password'], $user->password_hash)) {
            return response()->json([
                'status' => 'error',
                'message' => 'The username or password you entered is incorrect.',
                'code' => 401
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
            'username' => 'required|string|unique:Main.Users,username',
            'password' => 'required|string',
            'role_id'  => 'required|integer',
            'key_code' => 'required|string'
        ]);

        // 1. Double check the key is still valid
        $key = RegistrationKey::where('key_code', $fields['key_code'])
            ->where('is_used', false)
            ->first();

        if (!$key) {
            return response()->json(['message' => 'Registration key is no longer valid.'], 422);
        }

        // 2. Create the User record in Main.Users
        $user = User::create([
            'username' => $fields['username'],
            'password_hash' => Hash::make($fields['password']),
            // Note: You may need to create an Employee record first if employeeID is required
            'employeeID' => $key->employee_id ?? null
        ]);

        // 3. Mark the key as used so it can't be used again
        $key->update(['is_used' => true]);

        return response()->json([
            'status' => 'success',
            'message' => 'Account created successfully!'
        ], 201);
    }
}
