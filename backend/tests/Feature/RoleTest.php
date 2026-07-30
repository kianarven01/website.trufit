<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use App\Domains\Auth\Domain\Models\User;
use App\Domains\Employee\Domain\Models\Employee;
use App\Domains\Role\Domain\Models\Role;

class RoleTest extends TestCase
{
    use DatabaseTransactions;

    protected User $adminUser;
    protected User $regularUser;
    protected Role $adminRole;
    protected Role $technicianRole;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminRole = Role::create([
            'name' => 'Admin',
            'permissions' => ['system.manage_roles', 'system.manage_employees', 'system.onboard'],
        ]);

        $this->technicianRole = Role::create([
            'name' => 'Technician',
            'permissions' => ['appointments.view', 'customers.view', 'services.view_job_orders'],
        ]);

        $adminEmployee = Employee::create([
            'id' => 1,
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@trufit.com',
            'position' => 'Administrator',
            'roleID' => $this->adminRole->id,
            'status' => true,
        ]);

        $this->adminUser = User::create([
            'username' => 'admin',
            'password_hash' => bcrypt('password'),
            'employeeID' => $adminEmployee->id,
        ]);

        $techEmployee = Employee::create([
            'id' => 2,
            'first_name' => 'Tech',
            'last_name' => 'User',
            'email' => 'tech@trufit.com',
            'position' => 'Technician',
            'roleID' => $this->technicianRole->id,
            'status' => true,
        ]);

        $this->regularUser = User::create([
            'username' => 'tech',
            'password_hash' => bcrypt('password'),
            'employeeID' => $techEmployee->id,
        ]);
    }

    public function test_admin_can_get_roles(): void
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/admin/roles');

        $response->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'permissions'],
                ],
            ]);
    }

    public function test_regular_user_can_get_roles(): void
    {
        $response = $this->actingAs($this->regularUser, 'sanctum')
            ->getJson('/api/admin/roles');

        $response->assertOk();
    }

    public function test_admin_can_create_role(): void
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/admin/roles', [
                'name' => 'Supervisor',
                'permissions' => ['appointments.view', 'appointments.manage', 'customers.view'],
            ]);

        $response->assertCreated()
            ->assertJsonPath('status', 'success');

        $this->assertDatabaseHas('Roles', ['name' => 'Supervisor']);
    }

    public function test_regular_user_cannot_create_role(): void
    {
        $response = $this->actingAs($this->regularUser, 'sanctum')
            ->postJson('/api/admin/roles', [
                'name' => 'Hacker',
                'permissions' => ['system.manage_roles'],
            ]);

        $response->assertForbidden();
    }

    public function test_admin_can_update_role(): void
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->putJson("/api/admin/roles/{$this->technicianRole->id}", [
                'name' => 'Senior Technician',
                'permissions' => ['appointments.view', 'appointments.manage', 'customers.view', 'customers.manage'],
            ]);

        $response->assertOk()
            ->assertJsonPath('status', 'success');

        $this->assertDatabaseHas('Roles', [
            'id' => $this->technicianRole->id,
            'name' => 'Senior Technician',
        ]);
    }

    public function test_regular_user_cannot_update_role(): void
    {
        $response = $this->actingAs($this->regularUser, 'sanctum')
            ->putJson("/api/admin/roles/{$this->technicianRole->id}", [
                'name' => 'Hacked Role',
            ]);

        $response->assertForbidden();
    }

    public function test_admin_can_delete_role(): void
    {
        $tempRole = Role::create([
            'name' => 'TempRole',
            'permissions' => ['appointments.view'],
        ]);

        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->deleteJson("/api/admin/roles/{$tempRole->id}");

        $response->assertOk()
            ->assertJsonPath('status', 'success');

        $this->assertDatabaseMissing('Roles', ['id' => $tempRole->id]);
    }

    public function test_cannot_delete_admin_role(): void
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->deleteJson("/api/admin/roles/{$this->adminRole->id}");

        $response->assertBadRequest()
            ->assertJsonPath('message', 'The Admin role cannot be deleted');
    }

    public function test_cannot_delete_role_with_employees(): void
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->deleteJson("/api/admin/roles/{$this->technicianRole->id}");

        $response->assertBadRequest()
            ->assertJsonPath('status', 'error');
    }

    public function test_regular_user_cannot_delete_role(): void
    {
        $tempRole = Role::create([
            'name' => 'TempRole2',
            'permissions' => ['appointments.view'],
        ]);

        $response = $this->actingAs($this->regularUser, 'sanctum')
            ->deleteJson("/api/admin/roles/{$tempRole->id}");

        $response->assertForbidden();
    }

    public function test_duplicate_role_name_rejected(): void
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->postJson('/api/admin/roles', [
                'name' => 'Admin',
                'permissions' => ['appointments.view'],
            ]);

        $response->assertUnprocessable();
    }

    public function test_role_permissions_are_array(): void
    {
        $role = Role::create([
            'name' => 'TestRole',
            'permissions' => ['appointments.view', 'customers.view'],
        ]);

        $this->assertIsArray($role->permissions);
        $this->assertCount(2, $role->permissions);
        $this->assertContains('appointments.view', $role->permissions);
    }
}
