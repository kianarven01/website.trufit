<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    
        {
            // 1. Cleaner Validation Handling
            // If this fails, Laravel automatically returns a 422 Unprocessable Entity
            $fields = $request->validate([
                'username' => 'required|string',
                'password' => 'required|string'
            ]);

            $user = User::where('username', $fields['username'])->first();

            // 2. Clearer 401 Unauthorized Response
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
                    'token' => $token
                ]
            ], 200);
        }
}