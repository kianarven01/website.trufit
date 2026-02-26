<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\RegistrationKey;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;


class RegistrationKeyController extends Controller
{
    public function getRoles()
    {

        $roles = Role::all(['id', 'name', 'permissions']);

        return response()->json([
            'status' => 'success',
            'data'   => $roles
        ]);
    }

    public function generate(Request $request)
    {

        $request->merge(['role_id' => (int) $request->role_id]);

        $request->validate([
            'role_id' => [
                'required',
                'integer',
                Rule::exists(Role::class, 'id')
            ]
        ]);

        $newKey = 'TRUFIT-' . strtoupper(bin2hex(random_bytes(3)));

        $keyEntry = RegistrationKey::create([
            'key_code'   => $newKey,
            'role_id'    => $request->role_id,
            'is_used'    => false,
            'expires_at' => now()->addHours(24),
        ]);

        return response()->json([
            'status' => 'success',
            'data' => ['key' => $keyEntry->key_code]
        ]);
    }

    // RegistrationKeyController.php
    public function verify(Request $request)
    {
        $request->validate(['key_code' => 'required|string']);

        $key = RegistrationKey::where('key_code', $request->key_code)
            ->where('is_used', false)
            ->first();

        if (!$key) {
            return response()->json(['message' => 'Key invalid or used.'], 422);
        }

        // IMPORTANT: Load the employee so the frontend gets the Name and Position
        $employee = DB::table('Main.Employees')->where('id', $key->employee_id)->first();

        return response()->json([
            'status' => 'success',
            'employee_name' => $employee->name ?? 'Unknown',
            'position' => $employee->position ?? 'Staff',
            'validKey' => $key->key_code
        ]);
    }
}
