<?php

namespace App\Domains\KeyManagement\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\KeyManagement\Http\Requests\GenerateKeyRequest;
use App\Domains\KeyManagement\Application\DTOs\GenerateKeyDTO;
use App\Domains\KeyManagement\Application\Services\KeyService;
use App\Domains\KeyManagement\Application\UseCases\VerifyRegistrationKey;
use App\Domains\KeyManagement\Http\Resources\RegistrationKeyResource;
use App\Domains\KeyManagement\Application\UseCases\ListRegistrationKeys;
use App\Domains\KeyManagement\Application\DTOs\CompleteRegistrationDTO;
use App\Domains\KeyManagement\Application\UseCases\CompleteRegistration;
use App\Domains\KeyManagement\Domain\Models\RegistrationKey;
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
                'message' => 'Failed to generate registration key: ' . $e->getMessage()
            ], 500);
        }
    }

    public function index(Request $request, ListRegistrationKeys $useCase)
    {
        // Capture the filter from the URL (?status=pending)
        $status = $request->query('status', 'all'); 

        // Execute the UseCase with the filter
        // eturn the array response already formatted by the Resource in the UseCase
        return response()->json($useCase->execute($status));
    }

    public function verify(Request $request, VerifyRegistrationKey $useCase)
    {
        // The DTO/Validation happens first
        $request->validate(['key_code' => 'required|string']);

        try {
            // The UseCase handles the logic of finding and validating the key
            $keyRecord = $useCase->execute($request->key_code);

            // The Controller uses the Resource to return the specific data the UI needs
            return (new RegistrationKeyResource($keyRecord))
            ->additional(['status' => 'success']);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Key not found or already used.' 
            ], 404);
        }
    }

    public function register(Request $request, CompleteRegistration $useCase)
    {
        $validated = $request->validate([
            'username' => 'required|unique:UserCredentials,username',
            'password' => 'required|min:8',
            'key_code' => 'required'
        ]);

        try {
            $dto = CompleteRegistrationDTO::fromRequest($validated);
            $useCase->execute($dto);

            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()//'Registration failed. Please try again.'
            ], 500);
        }
    }

    public function regenerate($id, KeyService $service)
    {
        try {
            $newCode = $service->regenerateKey($id);
            return response()->json([
                'status' => 'success',
                'key' => $newCode
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to regenerate key.'
            ], 500);
        }
    }

    public function destroy($id, AuditServiceInterface $auditService)
    {
        try {
            $key = RegistrationKey::findOrFail($id);
            
            // Audit before deleting
            $auditService->log(
                'ONBOARDING', 
                'REGISTRATION_CANCELLED', 
                null, 
                RegistrationKey::class, 
                (string)$id,
                ['employee_name' => trim($key->first_name . ' ' . $key->last_name), 'email' => $key->email]
            );

            $key->delete();
            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete registration.'
            ], 500);
        }
    }

}