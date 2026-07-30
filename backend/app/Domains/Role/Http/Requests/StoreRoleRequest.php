<?php

namespace App\Domains\Role\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRoleRequest extends FormRequest
{
    private const VALID_PERMISSIONS = [
        'appointments.view',
        'appointments.manage',
        'customers.view',
        'customers.manage',
        'services.view_job_orders',
        'services.manage_job_orders',
        'services.manage_catalog',
        'sales.view',
        'sales.manage',
        'products.view',
        'products.manage',
        'purchasing.view',
        'purchasing.manage',
        'system.manage_employees',
        'system.onboard',
        'system.manage_roles',
    ];

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:Roles,name',
            'permissions' => 'nullable|array',
            'permissions.*' => ['string', Rule::in(self::VALID_PERMISSIONS)],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Role name is required',
            'name.unique' => 'A role with this name already exists',
            'permissions.array' => 'Permissions must be an array',
            'permissions.*.in' => 'Permission :input is not a valid permission',
        ];
    }
}
