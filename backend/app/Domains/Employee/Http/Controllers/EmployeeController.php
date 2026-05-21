<?php

namespace App\Domains\Employee\Http\Controllers;
use App\Http\Controllers\Controller;
use App\Domains\Employee\Application\UseCases\ListEmployees;
use App\Domains\KeyManagement\Application\Services\KeyService;
use App\Domains\KeyManagement\Application\DTOs\GenerateKeyDTO;
use App\Domains\KeyManagement\Http\Requests\GenerateKeyRequest;
use App\Domains\KeyManagement\Application\UseCases\ListRegistrationKeys;
use App\Domains\Role\Domain\Models\Role;
use App\Domains\Employee\Domain\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;


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

    public function update(Request $request, int $id)
    {
        $employee = Employee::findOrFail($id);

        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name'  => 'sometimes|string|max:255',
            'email'      => 'sometimes|email|max:255',
            'phone'      => 'sometimes|nullable|string|max:50',
            'address'    => 'sometimes|nullable|string|max:500',
            'position'   => 'sometimes|nullable|string|max:255',
            'role_id'    => ['sometimes', Rule::exists(Role::class, 'id')],
        ]);

        // Map role_id to roleID column name used by the model
        if (isset($validated['role_id'])) {
            $validated['roleID'] = $validated['role_id'];
            unset($validated['role_id']);
        }

        $employee->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Employee updated successfully',
            'data' => $employee->fresh()->load('role'),
        ]);
    }

    public function terminate(int $id)
    {
        $employee = Employee::findOrFail($id);

        // Soft delete: set status to false instead of actually deleting
        $employee->update(['status' => false]);

        return response()->json([
            'status' => 'success',
            'message' => 'Employee terminated successfully',
        ]);
    }
}

