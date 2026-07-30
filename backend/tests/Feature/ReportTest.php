<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use App\Domains\Auth\Domain\Models\User;
use App\Domains\Employee\Domain\Models\Employee;
use App\Domains\Role\Domain\Models\Role;

class ReportTest extends TestCase
{
    use DatabaseTransactions;

    protected User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::create([
            'name' => 'Admin',
            'permissions' => ['system.manage_roles'],
        ]);

        $employee = Employee::create([
            'id' => 20,
            'first_name' => 'Report',
            'last_name' => 'User',
            'email' => 'report@test.com',
            'position' => 'Administrator',
            'roleID' => $adminRole->id,
            'status' => true,
        ]);

        $this->adminUser = User::create([
            'username' => 'report_admin',
            'password_hash' => bcrypt('password'),
            'employeeID' => $employee->id,
        ]);
    }

    public function test_sales_report_returns_success(): void
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/reports/sales?start_date=2026-01-01&end_date=2026-12-31');

        $response->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'data' => [
                    'summary' => [
                        'total_sales',
                        'total_orders',
                        'completed_orders',
                        'pending_orders',
                        'average_order_value',
                    ],
                    'sales_by_type',
                    'daily_sales',
                    'top_services',
                    'period',
                ],
            ]);
    }

    public function test_inventory_report_returns_success(): void
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/reports/inventory');

        $response->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'data' => [
                    'summary' => [
                        'total_products',
                        'in_stock',
                        'low_stock',
                        'out_of_stock',
                        'total_inventory_value',
                    ],
                    'low_stock_items',
                    'inventory_details',
                ],
            ]);
    }

    public function test_financial_report_returns_success(): void
    {
        $response = $this->actingAs($this->adminUser, 'sanctum')
            ->getJson('/api/reports/financial?start_date=2026-01-01&end_date=2026-12-31');

        $response->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'data' => [
                    'summary' => [
                        'total_revenue',
                        'total_paid',
                        'outstanding_balance',
                        'collection_rate',
                    ],
                    'payments_by_method',
                    'daily_revenue',
                    'bills_by_status',
                    'period',
                ],
            ]);
    }

    public function test_reports_require_authentication(): void
    {
        $this->getJson('/api/reports/sales')->assertUnauthorized();
        $this->getJson('/api/reports/inventory')->assertUnauthorized();
        $this->getJson('/api/reports/financial')->assertUnauthorized();
    }
}
