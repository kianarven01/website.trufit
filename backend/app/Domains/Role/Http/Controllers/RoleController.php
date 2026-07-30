<?php

namespace App\Domains\Role\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Role\Domain\Models\Role;
use App\Domains\Role\Http\Requests\StoreRoleRequest;
use App\Domains\Role\Http\Requests\UpdateRoleRequest;
use App\Domains\Employee\Domain\Models\Employee;
use Illuminate\Http\JsonResponse;

class RoleController extends Controller
{
    public function index(): JsonResponse
    {
        $roles = Role::select('id', 'name', 'permissions')
            ->withCount('employees')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $roles,
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $role = Role::withCount('employees')->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $role,
        ]);
    }

    public function store(StoreRoleRequest $request): JsonResponse
    {
        $role = Role::create($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Role created successfully',
            'data' => $role->loadCount('employees'),
        ], 201);
    }

    public function update(UpdateRoleRequest $request, int $id): JsonResponse
    {
        $role = Role::findOrFail($id);

        // Prevent renaming Admin role
        if (strtolower($role->name) === 'admin' && strtolower($request->name) !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'The Admin role name cannot be changed',
            ], 400);
        }

        $role->update($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Role updated successfully',
            'data' => $role->fresh()->loadCount('employees'),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $role = Role::findOrFail($id);

        // Prevent deleting Admin role
        if (strtolower($role->name) === 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'The Admin role cannot be deleted',
            ], 400);
        }

        // Check if role is in use
        if ($role->employees()->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot delete role that is assigned to employees. Reassign them first.',
            ], 400);
        }

        $role->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Role deleted successfully',
        ]);
    }

    public function getAvailablePermissions(): JsonResponse
    {
        $permissionGroups = [
            'Appointments & Customers' => [
                'appointments.view' => 'Read-only access to calendar schedules and logs',
                'appointments.manage' => 'Create, reschedule, or cancel appointments',
                'customers.view' => 'Access customer profile lists and vehicle history',
                'customers.manage' => 'Add, edit, or remove customer accounts',
            ],
            'Sales & Services' => [
                'services.view_job_orders' => 'Track service tasks and job status',
                'services.manage_job_orders' => 'Create, dispatch, and close job orders',
                'services.manage_catalog' => 'Edit services, pricing, and categories',
                'sales.view' => 'Read estimates and transaction details',
                'sales.manage' => 'Draft, issue, and convert sales orders',
            ],
            'Operations & Inventory' => [
                'products.view' => 'Check parts directory and retail catalog',
                'products.manage' => 'Add, edit, or deprecate stock products',
                'purchasing.view' => 'View purchase orders and suppliers list',
                'purchasing.manage' => 'Issue POs and manage supplier relations',
            ],
            'System Administration' => [
                'system.manage_employees' => 'View employee profiles and soft-delete',
                'system.onboard' => 'Generate new employee registration keys',
                'system.manage_roles' => 'Full access to modify user roles and permissions',
            ],
        ];

        return response()->json([
            'status' => 'success',
            'data' => $permissionGroups,
        ]);
    }
}
