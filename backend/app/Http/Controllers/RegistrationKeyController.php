<?php

namespace App\Http\Controllers;

use App\Models\RegistrationKey;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Role;


class RegistrationKeyController extends Controller
{
    public function generate(Request $request)
    {
        // 1. Validate that the Admin sent a valid Role ID
        $request->validate([
            'role_id' => 'required|integer'
        ]);

        // 2. Generate a clean, readable key (e.g., TRUFIT-XJ92L)
        $newKey = 'TRUFIT-' . strtoupper(Str::random(6));

        // 3. We can't SAVE yet (because we haven't migrated), 
        // but we can return it to React to test the UI!
        return response()->json([
            'status' => 'success',
            'message' => 'Key generated successfully',
            'data' => [
                'key' => $newKey,
                'role_id' => $request->role_id,
                'expires_in' => '24 Hours'
            ]
        ]);
    }

    public function verify(Request $request)
    {
        $request->validate(['key_code' => 'required|string']);

        // Find the key in the Main schema
        $key = RegistrationKey::where('key_code', $request->key_code)
            ->where('is_used', false)
            ->first();

        if (!$key) {
            return response()->json(['message' => 'Invalid or expired key'], 422);
        }

        // Get the role name so the UI can say "Welcome, New Technician!"
        $role = Role::find($key->role_id);

        return response()->json([
            'status' => 'success',
            'role_name' => $role->name,
            'role_id' => $role->id
        ]);
    }
}
