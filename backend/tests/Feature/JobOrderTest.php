<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Domains\Customer\Domain\Models\Customer;
use App\Domains\Customer\Domain\Models\CustomerVehicle;
use App\Domains\Product\Domain\Models\Product;
use App\Domains\Product\Domain\Models\ServiceType;
use App\Domains\Inventory\Domain\Models\Inventory;
use App\Domains\SalesOrder\Domain\Models\SalesOrder;
use App\Domains\SalesOrder\Domain\Models\SalesOrderItem;
use App\Domains\JobOrder\Domain\Models\JobOrder;
use App\Domains\JobOrder\Domain\Models\JobOrderService;
use App\Domains\JobOrder\Domain\Models\JobOrderTechnician;
use App\Domains\Billing\Domain\Models\BillingStatement;
use App\Domains\Billing\Domain\Models\BillingStatementItem;
use App\Domains\Estimate\Domain\Models\Estimate;
use App\Domains\Estimate\Domain\Models\EstimateItem;
use App\Domains\Auth\Domain\Models\User;
use App\Domains\Employee\Domain\Models\Employee;
use App\Domains\Supplier\Domain\Models\Supplier;
use App\Domains\Supplier\Domain\Models\ProductSupplier;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class JobOrderTest extends TestCase
{
    use DatabaseTransactions;

    protected $employee;
    protected $user;
    protected $customer;
    protected $vehicle;
    protected $product;
    protected $supplier;
    protected $productSupplier;
    protected $inventory;
    protected $serviceType;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed Status records if not present
        $this->seedJobOrderStatuses();

        // Employee
        $this->employee = Employee::create([
            'id' => 99999,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'position' => 'Mechanic',
            'roleID' => 1,
        ]);

        // Second employee for multi-tech tests
        $this->employee2 = Employee::create([
            'id' => 99998,
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'email' => 'jane@example.com',
            'position' => 'Mechanic',
            'roleID' => 1,
        ]);

        // User
        $this->user = User::create([
            'username' => 'johndoe',
            'password_hash' => bcrypt('password'),
            'employeeID' => $this->employee->id,
        ]);

        // Customer
        $this->customer = Customer::create([
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'mobile_number' => '09123456789',
        ]);

        // Vehicle
        $this->vehicle = CustomerVehicle::create([
            'customerID' => $this->customer->customer_id,
            'plate_number' => 'ABC' . rand(1000, 9999),
            'engine_number' => 'E123456',
            'VIN' => 'V123456',
            'color' => 'Red',
            'registration_number' => 'REG1234',
            'selling_dealer' => 'Dealer',
            'make' => 'Suzuki',
            'model' => 'Swift',
        ]);

        // Product
        $this->product = Product::create([
            'id' => (string) Str::uuid(),
            'SKU' => 'PROD-001',
            'name' => 'Engine Oil 5W30',
            'item_type' => 'part',
            'conversion_factor' => 1,
            'selling_price' => 500.00,
        ]);

        // Supplier
        $this->supplier = Supplier::create([
            'id' => (string) Str::uuid(),
            'CompanyName' => 'Oil Supplier Inc',
            'CompanyContact' => 'John Contact',
            'Email' => 'john@supplier.com',
            'ContactNumber' => '09123456789',
            'address' => 'Supplier Address',
            'supplier_code' => 'SUPP-' . rand(1000, 9999),
        ]);

        // Product Supplier
        $this->productSupplier = ProductSupplier::create([
            'id' => (string) Str::uuid(),
            'product_id' => $this->product->id,
            'supplier_id' => $this->supplier->id,
            'supplier_cost' => 300.00,
            'is_vat' => false,
        ]);

        // Stock Location
        $this->locationId = (string) Str::uuid();
        DB::table('Main.StockLocations')->insert([
            'id' => $this->locationId,
            'code' => 'MAIN',
            'name' => 'Main Warehouse',
            'is_active' => true,
        ]);

        // Inventory
        $this->inventory = Inventory::create([
            'productID' => $this->product->id,
            'product_supplier_id' => $this->productSupplier->id,
            'quantity_on_hand' => 10,
            'reserved_quantity' => 0,
            'sell_price' => 500.00,
            'location_id' => $this->locationId,
        ]);

        // Service Type
        $this->serviceType = ServiceType::create([
            'id' => (string) Str::uuid(),
            'name' => 'Oil Change',
            'pricing_type' => 'fixed',
            'price' => 800.00,
            'duration' => 60,
        ]);
    }

    /* ================================================================
     *  HELPERS
     * ================================================================ */

    private function seedJobOrderStatuses(): void
    {
        $statuses = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
        foreach ($statuses as $name) {
            DB::connection('pgsql')
                ->statement("
                    INSERT INTO \"Main\".\"Status\" (id, name, category)
                    SELECT gen_random_uuid(), ?, 'JOB_ORDER'
                    WHERE NOT EXISTS (
                        SELECT 1 FROM \"Main\".\"Status\" WHERE name = ? AND category = 'JOB_ORDER'
                    )
                ", [$name, $name]);
        }
    }

    private function getStatusId(string $name): string
    {
        $status = DB::connection('pgsql')
            ->table('Main.Status')
            ->where('name', $name)
            ->where('category', 'JOB_ORDER')
            ->first();

        return $status->id;
    }

    private function createJobOrder(array $overrides = []): string
    {
        $pendingId = $this->getStatusId('Pending');
        $joNumber = JobOrder::generateJoNumber();

        $defaults = [
            'jo_number' => $joNumber,
            'VehicleID' => '',
            'TechnicianID' => null,
            'date' => now(),
            'status' => $pendingId,
            'vehicle_id_new' => $this->vehicle->id,
        ];

        $jobOrder = JobOrder::create(array_merge($defaults, $overrides));
        return $jobOrder->id;
    }

    /* ================================================================
     *  TESTS
     * ================================================================ */

    public function test_create_jo_with_services()
    {
        $this->actingAs($this->user);

        $payload = [
            'vehicle_id' => $this->vehicle->id,
            'date' => now()->toDateString(),
            'services' => [
                [
                    'service_id' => $this->serviceType->id,
                    'price' => 800.00,
                ],
            ],
        ];

        $response = $this->postJson('/api/job-orders', $payload);
        $response->assertStatus(201);
        $response->assertJsonStructure([
            'message',
            'data' => ['id', 'jo_number', 'status'],
        ]);

        $joId = $response->json('data.id');
        $jo = JobOrder::find($joId);

        $this->assertNotNull($jo);
        $this->assertNotNull($jo->jo_number);
        $this->assertStringStartsWith('JO-', $jo->jo_number);
        $this->assertEquals($this->vehicle->id, $jo->vehicle_id_new);

        // Verify services created
        $services = JobOrderService::where('JobOrderID', $joId)->get();
        $this->assertCount(1, $services);
        $this->assertEquals($this->serviceType->id, $services->first()->ServiceID);
        $this->assertEquals(800.00, $services->first()->PriceAtSale);

        // Verify status is Pending
        $this->assertEquals($this->getStatusId('Pending'), $jo->status);
    }

    public function test_jo_status_transitions()
    {
        $this->actingAs($this->user);

        $joId = $this->createJobOrder();

        // Pending → In Progress
        $res1 = $this->patchJson("/api/job-orders/{$joId}/status", ['status' => 'In Progress']);
        $res1->assertOk();
        $this->assertEquals($this->getStatusId('In Progress'), JobOrder::find($joId)->status);

        // In Progress → Completed
        $res2 = $this->patchJson("/api/job-orders/{$joId}/status", ['status' => 'Completed']);
        $res2->assertOk();
        $this->assertEquals($this->getStatusId('Completed'), JobOrder::find($joId)->status);

        // Cannot transition from Completed
        $res3 = $this->patchJson("/api/job-orders/{$joId}/status", ['status' => 'In Progress']);
        $res3->assertStatus(422);

        // Cannot skip: Pending → Completed
        $joId2 = $this->createJobOrder();
        $res4 = $this->patchJson("/api/job-orders/{$joId2}/status", ['status' => 'Completed']);
        $res4->assertStatus(422);

        // Pending → Cancelled (valid)
        $res5 = $this->patchJson("/api/job-orders/{$joId2}/status", ['status' => 'Cancelled']);
        $res5->assertOk();
        $this->assertEquals($this->getStatusId('Cancelled'), JobOrder::find($joId2)->status);
    }

    public function test_timer_full_cycle()
    {
        $this->actingAs($this->user);

        // Create JO and move to In Progress
        $joId = $this->createJobOrder();
        $this->patchJson("/api/job-orders/{$joId}/status", ['status' => 'In Progress'])->assertOk();

        // Cannot start timer on Pending JO
        $joId2 = $this->createJobOrder();
        $this->postJson("/api/job-orders/{$joId2}/timer/start")->assertStatus(422);

        // Start timer
        $res = $this->postJson("/api/job-orders/{$joId}/timer/start");
        $res->assertOk();
        $this->assertEquals('running', JobOrder::find($joId)->timer_status);
        $this->assertNotNull(JobOrder::find($joId)->timer_started_at);

        // Cannot start again (already running)
        $this->postJson("/api/job-orders/{$joId}/timer/start")->assertStatus(422);

        // Pause timer
        $res2 = $this->postJson("/api/job-orders/{$joId}/timer/pause");
        $res2->assertOk();
        $jo = JobOrder::find($joId);
        $this->assertEquals('paused', $jo->timer_status);
        $this->assertNull($jo->timer_started_at);

        // Cannot pause again (already paused)
        $this->postJson("/api/job-orders/{$joId}/timer/pause")->assertStatus(422);

        // Resume timer
        $res3 = $this->postJson("/api/job-orders/{$joId}/timer/resume");
        $res3->assertOk();
        $jo = JobOrder::find($joId);
        $this->assertEquals('running', $jo->timer_status);
        $this->assertNotNull($jo->timer_started_at);

        // Cannot resume when running
        $this->postJson("/api/job-orders/{$joId}/timer/resume")->assertStatus(422);

        // Stop timer
        $res4 = $this->postJson("/api/job-orders/{$joId}/timer/stop");
        $res4->assertOk();
        $jo = JobOrder::find($joId);
        $this->assertNull($jo->timer_status);
        $this->assertNull($jo->timer_started_at);

        // Cannot stop again (not active)
        $this->postJson("/api/job-orders/{$joId}/timer/stop")->assertStatus(422);
    }

    public function test_assign_and_remove_technician()
    {
        $this->actingAs($this->user);

        $joId = $this->createJobOrder();

        // Assign tech
        $res = $this->postJson("/api/job-orders/{$joId}/technicians", [
            'employee_id' => $this->employee->id,
            'role' => 'PRIMARY',
        ]);
        $res->assertStatus(201);
        $this->assertEquals(1, JobOrderTechnician::where('JobOrderID', $joId)->whereNull('removed_at')->count());

        // Get technicians
        $res2 = $this->getJson("/api/job-orders/{$joId}/technicians");
        $res2->assertOk();
        $this->assertCount(1, $res2->json('data'));

        // Remove tech
        $res3 = $this->deleteJson("/api/job-orders/{$joId}/technicians/{$this->employee->id}");
        $res3->assertOk();

        // Verify removed_at set
        $assignment = JobOrderTechnician::where('JobOrderID', $joId)
            ->where('employee_id', $this->employee->id)
            ->first();
        $this->assertNotNull($assignment->removed_at);

        // Verify no active techs
        $this->assertEquals(0, JobOrderTechnician::where('JobOrderID', $joId)->whereNull('removed_at')->count());
    }

    public function test_cannot_assign_duplicate_technician()
    {
        $this->actingAs($this->user);

        $joId = $this->createJobOrder();

        // First assignment — OK
        $this->postJson("/api/job-orders/{$joId}/technicians", [
            'employee_id' => $this->employee->id,
            'role' => 'PRIMARY',
        ])->assertStatus(201);

        // Duplicate — 422
        $this->postJson("/api/job-orders/{$joId}/technicians", [
            'employee_id' => $this->employee->id,
            'role' => 'ASSISTANT',
        ])->assertStatus(422);
    }

    public function test_full_estimate_to_so_to_jo_flow()
    {
        $this->actingAs($this->user);

        // 1. Create Estimate with parts + services
        $estimate = Estimate::create([
            'id' => (string) Str::uuid(),
            'customer_id' => $this->customer->customer_id,
            'vehicle_id' => $this->vehicle->id,
            'status' => 'DRAFT',
            'total_amount' => 1800.00,
            'estimate_number' => 'EST-' . now()->format('ymd') . '-' . rand(1000, 9999),
            'created_by' => $this->employee->id,
        ]);

        // Part item
        EstimateItem::create([
            'id' => (string) Str::uuid(),
            'estimate_id' => $estimate->id,
            'item_type' => 'part',
            'product_id' => $this->product->id,
            'quantity' => 2,
            'unit_price' => 500.00,
            'subtotal' => 1000.00,
        ]);

        // Service item
        EstimateItem::create([
            'id' => (string) Str::uuid(),
            'estimate_id' => $estimate->id,
            'item_type' => 'service',
            'service_id' => $this->serviceType->id,
            'quantity' => 1,
            'unit_price' => 800.00,
            'subtotal' => 800.00,
        ]);

        // 2. Approve Estimate via API
        $response = $this->putJson("/api/estimates/{$estimate->id}", [
            'status' => 'APPROVED',
        ]);
        $response->assertOk();

        // 3. Verify SO created with parts
        $so = SalesOrder::where('estimate_id', $estimate->id)->first();
        $this->assertNotNull($so, 'Sales Order should be created');
        $this->assertEquals('APPROVED', $so->Status);
        $this->assertEquals('REPAIR', $so->type);
        $this->assertEquals($this->customer->customer_id, $so->customerID);

        $soItems = SalesOrderItem::where('SalesOrderID', $so->id)->get();
        $this->assertCount(1, $soItems);
        $this->assertEquals($this->product->id, $soItems->first()->ProductID);
        $this->assertEquals(2, $soItems->first()->quantity);

        // 4. Verify JO created with services
        $jo = JobOrder::where('SaleOrderID', $so->id)->first();
        $this->assertNotNull($jo, 'Job Order should be created');
        $this->assertEquals($this->getStatusId('Pending'), $jo->status);

        $joServices = JobOrderService::where('JobOrderID', $jo->id)->get();
        $this->assertCount(1, $joServices);
        $this->assertEquals($this->serviceType->id, $joServices->first()->ServiceID);
        $this->assertEquals(800.00, $joServices->first()->PriceAtSale);

        // 5. Verify SO links to JO
        $so->refresh();
        $this->assertEquals($jo->id, $so->job_order_id);

        // 6. Verify JO links back to SO
        $this->assertEquals($so->id, $jo->SaleOrderID);
    }

    public function test_billing_created_on_complete()
    {
        $this->actingAs($this->user);

        // Create SO directly with items
        $so = SalesOrder::create([
            'id' => (string) Str::uuid(),
            'so_number' => 'SO-' . now()->format('ymd') . '-' . rand(1000, 9999),
            'customerID' => $this->customer->customer_id,
            'vehicle_id' => $this->vehicle->id,
            'employee' => $this->employee->id,
            'type' => 'REPAIR',
            'Total' => 1000.00,
            'Balance' => 1000.00,
            'Status' => 'IN_PROGRESS',
            'submitted_by' => $this->user->id,
            'submitted_at' => now(),
            'approved_by' => $this->user->id,
            'approved_at' => now(),
        ]);

        SalesOrderItem::create([
            'id' => (string) Str::uuid(),
            'SalesOrderID' => $so->id,
            'ProductID' => $this->product->id,
            'quantity' => 2,
            'UnitPrice' => 500.00,
            'SubTotal' => 1000.00,
            'CostAtSale' => 300.00,
        ]);

        // Create linked JO
        $joId = $this->createJobOrder([
            'SaleOrderID' => $so->id,
        ]);
        $so->update(['job_order_id' => $joId]);

        // Start and complete JO (triggers SO completion automatically)
        $this->patchJson("/api/job-orders/{$joId}/status", ['status' => 'In Progress'])->assertOk();
        $this->postJson("/api/job-orders/{$joId}/timer/start")->assertOk();
        $this->postJson("/api/job-orders/{$joId}/timer/stop")->assertOk();
        $this->patchJson("/api/job-orders/{$joId}/status", ['status' => 'Completed'])->assertOk();

        // SO should already be COMPLETED via JO completion
        $so->refresh();
        $this->assertEquals('COMPLETED', $so->Status);

        // Verify billing statement created
        $bill = BillingStatement::where('SOID', $so->id)->where('status', '!=', 'Cancelled')->first();
        $this->assertNotNull($bill, 'Billing statement should be created on SO complete');
        $this->assertEquals(1000.00, $bill->Total);

        // Verify billing items
        $billItems = BillingStatementItem::where('BillingStatementID', $bill->id)->get();
        $this->assertGreaterThanOrEqual(1, $billItems->count());
        $this->assertEquals(2, $billItems->first()->quantity);
        $this->assertEquals(500.00, $billItems->first()->UnitPrice);
    }
}
