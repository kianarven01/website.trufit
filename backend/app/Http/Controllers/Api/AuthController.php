<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
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


        if (
            $fields['username'] === env('SUPER_ADMIN_USERNAME') &&
            $fields['password'] === env('SUPER_ADMIN_PASSWORD')
        ) {

            return response()->json([
                'status' => 'success',
                'message' => 'Super Admin Access Granted',
                'data' => [
                    'user' => [
                        'id' => 0, // Ghost ID for super admin
                        'username' => 'Healer',
                    ],
                    'token' => 'static_or_generated_token',
                    'role' => 'super_admin',
                    'permissions' => ['*']
                ]
            ], 200);
        }

        $user = User::with('employee.role')
            ->where('username', $fields['username'])
            ->first();

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
                'user'  => $user,
                'token' => $token,
                'role'  => $user->employee->role->name ?? 'Staff',
                'permissions' => $user->employee->role->permissions ?? []
            ]
        ], 200);
    }


    public function register(Request $request)
    {
        $fields = $request->validate([
            'username' => 'required|string|unique:pgsql.Main.UserCredentials,username',
            'password' => 'required|string|min:8',
            'key_code' => 'required|string',
        ]);

        return DB::transaction(function () use ($fields) {
            // 1. Find the key and verify it hasn't been used
            $key = DB::table('Main.RegistrationKeys')
                ->where('key_code', $fields['key_code'])
                ->where('is_used', false)
                ->first();

            if (!$key) {
                return response()->json(['message' => 'Invalid or expired registration key.'], 422);
            }

            // 2. Create the UserCredentials
            DB::table('Main.UserCredentials')->insert([
                'employeeID'    => $key->employee_id,
                'username'      => $fields['username'],
                'password_hash' => Hash::make($fields['password']),
            ]);

            // 3. Mark the key as used and update timestamp
            DB::table('Main.RegistrationKeys')
                ->where('id', $key->id)
                ->update([
                    'is_used'    => true,
                    'updated_at' => now(),
                ]);

            return response()->json(['status' => 'success', 'message' => 'Account linked and created.']);
        });
    }

    public function verifyKey(Request $request)
    {
        $request->validate(['key_code' => 'required|string']);

        $keyInfo = DB::table('Main.RegistrationKeys')
            ->join('Main.Employees', 'Main.RegistrationKeys.employee_id', '=', 'Main.Employees.id')
            ->where('Main.RegistrationKeys.key_code', $request->key_code)
            ->where('Main.RegistrationKeys.is_used', false)
            ->select('Main.Employees.name', 'Main.Employees.position')
            ->first();

        if (!$keyInfo) {
            return response()->json(['status' => 'error', 'message' => 'Invalid or used key.'], 422);
        }

        // Ensure the response matches these exact keys
        return response()->json([
            'status' => 'success',
            'employee_name' => $keyInfo->name,
            'position' => $keyInfo->position
        ]);
    }
}
