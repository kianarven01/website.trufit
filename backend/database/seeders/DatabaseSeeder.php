<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Domains\Role\Domain\Models\Role;
use App\Domains\Employee\Domain\Models\Employee;
use App\Domains\Auth\Domain\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Default Role if not exists
        $role = Role::firstOrCreate(
            ['name' => 'Admin'],
            ['permissions' => []]
        );

        // 2. Create Default Employee if not exists
        $employee = Employee::firstOrCreate(
            ['id' => 1],
            [
                'first_name' => 'Trufit',
                'last_name' => 'Admin',
                'email' => 'arvenkian1234@gmail.com',
                'position' => 'Admin',
                'roleID' => $role->id,
                'status' => true,
                'address' => 'Localhost Office',
                'phone' => '09123456789'
            ]
        );

        // 3. Create UserCredentials if not exists
        User::firstOrCreate(
            ['username' => 'healer'],
            [
                'password_hash' => Hash::make('password'),
                'employeeID' => $employee->id
            ]
        );
    }
}
