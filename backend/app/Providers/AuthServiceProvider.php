<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use App\Domains\Auth\Domain\Models\User;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [];

    public function boot(): void
    {
        $this->registerPolicies();

        // Define permission-based gates
        $permissions = [
            // Appointments & Customers
            'appointments.view',
            'appointments.manage',
            'customers.view',
            'customers.manage',

            // Sales & Services
            'services.view_job_orders',
            'services.manage_job_orders',
            'services.manage_catalog',
            'sales.view',
            'sales.manage',

            // Operations & Inventory
            'products.view',
            'products.manage',
            'purchasing.view',
            'purchasing.manage',

            // System Administration
            'system.manage_employees',
            'system.onboard',
            'system.manage_roles',
        ];

        foreach ($permissions as $permission) {
            Gate::define($permission, function (User $user) use ($permission) {
                $employee = $user->employee;

                if (!$employee || !$employee->role) {
                    return false;
                }

                // Admin has all permissions
                if (strtolower($employee->role->name) === 'admin') {
                    return true;
                }

                $rolePermissions = $employee->role->permissions ?? [];

                return in_array($permission, $rolePermissions);
            });
        }

        // Define role-based gates
        Gate::define('isAdmin', function (User $user) {
            return $user->employee && strtolower($user->employee->role->name) === 'admin';
        });

        Gate::define('isSupervisor', function (User $user) {
            return $user->employee && strtolower($user->employee->role->name) === 'supervisor';
        });

        Gate::define('isTechnician', function (User $user) {
            return $user->employee && strtolower($user->employee->role->name) === 'technician';
        });

        Gate::define('isServiceAdvisor', function (User $user) {
            return $user->employee && strtolower($user->employee->role->name) === 'service_advisor';
        });

        // After permission check, we can also define an "any" gate that checks multiple permissions
        Gate::before(function (User $user, string $ability) {
            // Admin bypass for all gates
            if ($user->employee && strtolower($user->employee->role->name) === 'admin') {
                return true;
            }

            return null; // Continue to individual gate checks
        });
    }
}
