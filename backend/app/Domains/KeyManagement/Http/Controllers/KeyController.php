<?php

namespace App\Domains\KeyManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\KeyManagement\Http\Requests\GenerateKeyRequest;
use App\Domains\KeyManagement\Application\DTOs\GenerateKeyDTO;
use App\Domains\KeyManagement\Application\Services\KeyService;
use App\Domains\Keymanagement\Infrastructure\Repositories\RegistrationKeyRepository;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;


class KeyController extends Controller
{
    public function store(GenerateKeyRequest $request, KeyService $service)
    {
        try {
            $dto = GenerateKeyDTO::fromRequest($request->validated());
            $key = $service->generateForNewEmployee($dto);

            return response()->json([
                'status' => 'success',
                'key' => $key
            ]);
        } catch (\Exception $e) {
            // Log the actual error for debugging
            Log::error("Onboarding Failed: " . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to generate registration key. Please check database constraints.'
            ], 500);
        }
    }

    public function index(Request $request, RegistrationKeyRepository $repository)
    {
        // Capture the 'status' from the URL (e.g., /admin/registration-keys?status=all)
        $status = $request->query('status', 'all'); 
        $keys = $repository->getAll($status);

        return response()->json([
            'status' => 'success',
            'data' => $keys->map(fn($key) => [
                'id'            => $key->id,
                'employee_name' => $key->employee->name ?? 'Unknown',
                'email'         => $key->employee->email ?? 'Unknown',
                'key_code'      => $key->key_code,
                'status'        => $key->is_used ? 'used' : 'pending',
                'expires_at'    => $key->expires_at->format('n/j/Y'),
                'role_name'     => $key->role->name ?? 'N/A',
            ])
        ]);
    }
}