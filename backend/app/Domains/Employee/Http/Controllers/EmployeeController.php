<?php

namespace App\Domains\Employee\Http\Controllers;
use App\Http\Controllers\Controller;
use App\Domains\Employee\Application\UseCases\ListEmployees;
use App\Domains\KeyManagement\Application\Services\KeyService;
use App\Domains\KeyManagement\Application\DTOs\GenerateKeyDTO;
use App\Domains\KeyManagement\Http\Requests\GenerateKeyRequest;
use App\Domains\KeyManagement\Application\UseCases\ListRegistrationKeys;
use App\Domains\Role\Domain\Models\Role;


class EmployeeController extends Controller

{
    public function index(ListEmployees $useCase)
        {
            return response()->json($useCase->execute());
        }

    //for listing
    public function onboarding(ListRegistrationKeys $useCase)
    {
        // The controller in the Employee domain "asks" the KeyManagement domain for data
        return response()->json($useCase->execute());
    }

    public function getRoles()
    {
        // Fetch roles to populate the Select component in the modal
        $roles = Role::select('id', 'name')->get();

        return response()->json([
            'status' => 'success',
            'data' => $roles
        ]);
    }

}

