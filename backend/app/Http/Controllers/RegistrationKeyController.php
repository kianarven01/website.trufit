<?php

namespace App\Http\Controllers;

use App\Models\RegistrationKey;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Role;
use Illuminate\Validation\Rule;


class RegistrationKeyController extends Controller
{

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

    public function verify(Request $request)
    {
        $request->validate(['key_code' => 'required|string']);

        $key = RegistrationKey::where('key_code', $request->key_code)
            ->where('is_used', false)
            ->where('expires_at', '>', now())
            ->first();

        if (!$key) {
            return response()->json(['message' => 'This key is invalid, already used, or expired.'], 422);
        }

        $role = Role::find($key->role_id);

        return response()->json([
            'status'    => 'success',
            'role_name' => $role->name,
            'role_id'   => $role->id
        ]);
    }
}
