<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use App\Domains\Auth\Domain\Models\User;
use App\Domains\Employee\Domain\Models\Employee;
use App\Domains\Role\Domain\Models\Role;

class PermissionMiddlewareTest extends TestCase
{
    use DatabaseTransactions;

    protected User $adminUser;
    protected User $techUser;
    protected Role $adminRole;
    protected Role $techRole;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminRole = Role::create([
            'name' => 'Admin',
            'permissions' => ['system.manage_roles', 'system.manage_employees', 'system.onboard'],
        ]);

        $this->techRole = Role::create([
            'name' => 'Technician',
            'permissions' => ['appointments.view', 'customers.view'],
        ]);

        $adminEmployee = Employee::create([
            'id' => 10,
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@test.com',
            'position' => 'Administrator',
            'roleID' => $this->adminRole->id,
            'status' => true,
        ]);

        $this->adminUser = User::create([
            'username' => 'admin_perm',
            'password_hash' => bcrypt('password'),
            'employeeID' => $adminEmployee->id,
        ]);

        $techEmployee = Employee::create([
            'id' => 11,
            'first_name' => 'Tech',
            'last_name' => 'User',
            'email' => 'tech@test.com',
            'position' => 'Technician',
            'roleID' => $this->techRole->id,
            'status' => true,
        ]);

        $this->techUser = User::create([
            'username' => 'tech_perm',
            'password_hash' => bcrypt('password'),
            'employeeID' => $techEmployee->id,
        ]);
    }

    public function test_admin_bypasses_permission_check(): void
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/admin/roles', [
                'name' => 'NewRole',
                'permissions' => ['appointments.view'],
            ]);

        $response->assertCreated();
    }

    public function test_user_without_permission_gets_403(): void
    {
        $response = $this->actingAs($this->techUser, 'sanctum')
            ->postJson('/api/admin/roles', [
                'name' => 'ShouldFail',
                'permissions' => ['appointments.view'],
            ]);

        $response->assertForbidden();
    }

    public function test_user_with_permission_can_access(): void
    {
        $this->techRole->update([
            'permissions' => ['appointments.view', 'system.onboard'],
        ]);

        $response = $this->actingAs($this->techUser, 'sanctum')
            ->postJson('/api/admin/onboard-employee', [
                'role_id' => $this->techRole->id,
            ]);

        // Should not be 403 (may be 422 for validation, but not 403)
        $response->assertNotForbidden();
    }

    public function test_user_without_onboard_permission_gets_403(): void
    {
        $response = $this->actingAs($this->techUser, 'sanctum')
            ->postJson('/api/admin/onboard-employee', [
                'role_id' => $this->techRole->id,
            ]);

        $response->assertForbidden();
    }
}
