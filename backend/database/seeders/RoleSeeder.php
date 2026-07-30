<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Domains\Role\Domain\Models\Role;
use App\Domains\Employee\Domain\Models\Employee;
use App\Domains\Employee\Domain\Models\EmployeeSecurity;
use App\Domains\Auth\Domain\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $allPermissions = [
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

        $roles = [
            [
                'name' => 'Admin',
                'permissions' => $allPermissions,
            ],
            [
                'name' => 'Human Resource',
                'permissions' => [
                    'appointments.view',
                    'customers.view',
                    'customers.manage',
                    'system.manage_employees',
                    'system.onboard',
                ],
            ],
            [
                'name' => 'Accounting Head',
                'permissions' => [
                    'appointments.view',
                    'customers.view',
                    'services.view_job_orders',
                    'sales.view',
                    'sales.manage',
                    'products.view',
                    'purchasing.view',
                ],
            ],
            [
                'name' => 'Accounting Staff',
                'permissions' => [
                    'appointments.view',
                    'customers.view',
                    'services.view_job_orders',
                    'sales.view',
                    'products.view',
                ],
            ],
            [
                'name' => 'Purchasing Head',
                'permissions' => [
                    'customers.view',
                    'services.view_job_orders',
                    'products.view',
                    'products.manage',
                    'purchasing.view',
                    'purchasing.manage',
                ],
            ],
            [
                'name' => 'Purchasing Staff',
                'permissions' => [
                    'customers.view',
                    'products.view',
                    'purchasing.view',
                ],
            ],
            [
                'name' => 'Sales Head',
                'permissions' => [
                    'appointments.view',
                    'appointments.manage',
                    'customers.view',
                    'customers.manage',
                    'services.view_job_orders',
                    'services.manage_job_orders',
                    'sales.view',
                    'sales.manage',
                    'products.view',
                ],
            ],
            [
                'name' => 'Sales Staff',
                'permissions' => [
                    'appointments.view',
                    'appointments.manage',
                    'customers.view',
                    'customers.manage',
                    'services.view_job_orders',
                    'sales.view',
                    'sales.manage',
                    'products.view',
                ],
            ],
            [
                'name' => 'Warehouse Staff',
                'permissions' => [
                    'products.view',
                    'products.manage',
                    'purchasing.view',
                ],
            ],
            [
                'name' => 'Service Advisor',
                'permissions' => [
                    'appointments.view',
                    'appointments.manage',
                    'customers.view',
                    'customers.manage',
                    'services.view_job_orders',
                    'services.manage_job_orders',
                    'sales.view',
                    'sales.manage',
                    'products.view',
                ],
            ],
            [
                'name' => 'Receptionist',
                'permissions' => [
                    'appointments.view',
                    'appointments.manage',
                    'customers.view',
                    'customers.manage',
                ],
            ],
            [
                'name' => 'Foreman',
                'permissions' => [
                    'appointments.view',
                    'customers.view',
                    'services.view_job_orders',
                    'services.manage_job_orders',
                    'products.view',
                    'products.manage',
                ],
            ],
            [
                'name' => 'Technician Supervisor',
                'permissions' => [
                    'appointments.view',
                    'customers.view',
                    'services.view_job_orders',
                    'services.manage_job_orders',
                    'products.view',
                ],
            ],
            [
                'name' => 'Technician',
                'permissions' => [
                    'appointments.view',
                    'customers.view',
                    'services.view_job_orders',
                    'products.view',
                ],
            ],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['name' => $role['name']],
                ['permissions' => $role['permissions']]
            );
        }

        // Seed admin user
        $adminRole = Role::where('name', 'Admin')->first();
        if (!$adminRole) {
            return;
        }

        $adminId = 10000001;

        if (!Employee::find($adminId)) {
            Employee::create([
                'id' => $adminId,
                'first_name' => 'Admin',
                'last_name' => 'User',
                'email' => 'admin@trufit.com',
                'position' => 'Administrator',
                'roleID' => $adminRole->id,
                'status' => true,
                'join_date' => now(),
            ]);

            EmployeeSecurity::create([
                'employee_id' => $adminId,
                'email_verified_at' => now(),
                'failed_login_attempts' => 0,
            ]);

            User::create([
                'employeeID' => $adminId,
                'username' => 'admin',
                'password_hash' => Hash::make('password'),
            ]);

            $this->command->info('Admin account seeded successfully!');
            $this->command->info('Username: admin');
            $this->command->info('Password: password');
        }
    }
}
