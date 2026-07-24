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
use App\Domains\Estimate\Domain\Models\Estimate;
use App\Domains\Estimate\Domain\Models\EstimateItem;
use App\Domains\Auth\Domain\Models\User;
use App\Domains\Employee\Domain\Models\Employee;
use App\Domains\Supplier\Domain\Models\Supplier;
use App\Domains\Supplier\Domain\Models\ProductSupplier;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EstimateTest extends TestCase
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

        // Employee
        $this->employee = Employee::create([
            'id' => 88888,
            'first_name' => 'Test',
            'last_name' => 'Employee',
            'email' => 'test@example.com',
            'position' => 'Advisor',
            'roleID' => 1,
        ]);

        // User
        $this->user = User::create([
            'username' => 'testuser',
            'password_hash' => bcrypt('password'),
            'employeeID' => $this->employee->id,
        ]);

        // Customer (not appointment origin)
        $this->customer = Customer::create([
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'mobile_number' => '09123456789',
            'origin' => 'walk-in',
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

        // Supplier + ProductSupplier
        $this->supplier = Supplier::create([
            'id' => (string) Str::uuid(),
            'CompanyName' => 'Oil Supplier Inc',
            'CompanyContact' => 'John Contact',
            'Email' => 'john@supplier.com',
            'ContactNumber' => '09123456789',
            'address' => 'Supplier Address',
            'supplier_code' => 'SUPP-' . rand(1000, 9999),
        ]);

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

    private function createEstimate(array $overrides = []): Estimate
    {
        return Estimate::create(array_merge([
            'id' => (string) Str::uuid(),
            'customer_id' => $this->customer->customer_id,
            'vehicle_id' => $this->vehicle->id,
            'status' => 'DRAFT',
            'total_amount' => 0.00,
            'estimate_number' => 'EST-' . now()->format('ymd') . '-' . rand(1000, 9999),
            'created_by' => $this->user->id,
        ], $overrides));
    }

    /* ================================================================
     *  TESTS
     * ================================================================ */

    public function test_create_estimate_with_items()
    {
        $this->actingAs($this->user);

        $response = $this->postJson('/api/estimates', [
            'customer_id' => $this->customer->customer_id,
            'vehicle_id' => $this->vehicle->id,
            'total_amount' => 1800.00,
            'mileage' => 15000,
            'status' => 'DRAFT',
            'items' => [
                [
                    'item_type' => 'part',
                    'product_id' => $this->product->id,
                    'quantity' => 2,
                    'unit_price' => 500.00,
                    'subtotal' => 1000.00,
                ],
                [
                    'item_type' => 'service',
                    'service_id' => $this->serviceType->id,
                    'quantity' => 1,
                    'unit_price' => 800.00,
                    'subtotal' => 800.00,
                ],
            ],
        ]);

        $response->assertCreated();
        $this->assertEquals('DRAFT', $response->json('data.status'));
        $this->assertNotNull($response->json('data.estimate_number'));

        // Verify created_by is the user ID (not employee ID)
        $estimate = Estimate::find($response->json('data.id'));
        $this->assertEquals($this->user->id, $estimate->created_by);
    }

    public function test_cannot_approve_estimate_twice()
    {
        $this->actingAs($this->user);

        // Create estimate with parts + services
        $estimate = $this->createEstimate(['status' => 'FOR APPROVAL', 'total_amount' => 1000.00]);

        EstimateItem::create([
            'id' => (string) Str::uuid(),
            'estimate_id' => $estimate->id,
            'item_type' => 'part',
            'product_id' => $this->product->id,
            'quantity' => 2,
            'unit_price' => 500.00,
            'subtotal' => 1000.00,
        ]);

        EstimateItem::create([
            'id' => (string) Str::uuid(),
            'estimate_id' => $estimate->id,
            'item_type' => 'service',
            'service_id' => $this->serviceType->id,
            'quantity' => 1,
            'unit_price' => 800.00,
            'subtotal' => 800.00,
        ]);

        // First approval — should succeed
        $response1 = $this->putJson("/api/estimates/{$estimate->id}", [
            'status' => 'APPROVED',
        ]);
        $response1->assertOk();
        $this->assertNotNull($response1->json('sales_order.so_number'));
        $this->assertNotNull($response1->json('job_order.jo_number'));

        $soCount1 = SalesOrder::where('estimate_id', $estimate->id)->count();
        $this->assertEquals(1, $soCount1, 'Should have exactly 1 SO after first approval');

        // Second approval — should return existing SO+JO, not create duplicates
        $response2 = $this->putJson("/api/estimates/{$estimate->id}", [
            'status' => 'APPROVED',
        ]);
        $response2->assertOk();

        $soCount2 = SalesOrder::where('estimate_id', $estimate->id)->count();
        $this->assertEquals(1, $soCount2, 'Should still have exactly 1 SO after re-approval');

        $this->assertEquals($response1->json('sales_order.so_number'), $response2->json('sales_order.so_number'));
        $this->assertEquals($response1->json('job_order.jo_number'), $response2->json('job_order.jo_number'));
    }

    public function test_status_validation_rejects_invalid_status()
    {
        $this->actingAs($this->user);

        $estimate = $this->createEstimate();

        $response = $this->putJson("/api/estimates/{$estimate->id}", [
            'status' => 'GARBLED_STATUS',
        ]);

        $response->assertStatus(422);
    }

    public function test_status_validation_accepts_valid_statuses()
    {
        $this->actingAs($this->user);

        $estimate = $this->createEstimate();

        foreach (['DRAFT', 'FOR APPROVAL', 'APPROVED'] as $status) {
            $response = $this->putJson("/api/estimates/{$estimate->id}", [
                'status' => $status,
            ]);
            $response->assertOk();
            $estimate->refresh();
            $this->assertEquals($status, $estimate->status);
        }
    }

    public function test_audit_fields_use_user_credentials()
    {
        $this->actingAs($this->user);

        // Create
        $estimate = $this->createEstimate(['total_amount' => 500.00]);
        $this->assertEquals($this->user->id, $estimate->created_by);

        // Edit
        $this->putJson("/api/estimates/{$estimate->id}", [
            'total_amount' => 600.00,
            'items' => [
                [
                    'item_type' => 'part',
                    'product_id' => $this->product->id,
                    'quantity' => 1,
                    'unit_price' => 600.00,
                    'subtotal' => 600.00,
                ],
            ],
        ])->assertOk();

        $estimate->refresh();
        $this->assertEquals($this->user->id, $estimate->edited_by);

        // Approve
        $this->putJson("/api/estimates/{$estimate->id}", [
            'status' => 'APPROVED',
        ])->assertOk();

        $estimate->refresh();
        $this->assertEquals($this->user->id, $estimate->approved_by);
    }

    public function test_approve_returns_user_with_employee_data()
    {
        $this->actingAs($this->user);

        $estimate = $this->createEstimate(['total_amount' => 500.00]);

        EstimateItem::create([
            'id' => (string) Str::uuid(),
            'estimate_id' => $estimate->id,
            'item_type' => 'service',
            'service_id' => $this->serviceType->id,
            'quantity' => 1,
            'unit_price' => 500.00,
            'subtotal' => 500.00,
        ]);

        $response = $this->putJson("/api/estimates/{$estimate->id}", [
            'status' => 'APPROVED',
        ]);
        $response->assertOk();

        // Verify the estimate returned has user-based audit fields
        $data = $response->json('data');
        $this->assertNotNull($data['created_by']);
        $this->assertEquals($this->user->id, $data['created_by']);
    }

    public function test_list_estimates()
    {
        $this->actingAs($this->user);

        $e1 = $this->createEstimate(['status' => 'DRAFT']);
        $e2 = $this->createEstimate(['status' => 'FOR APPROVAL']);

        $response = $this->getJson('/api/estimates');
        $response->assertOk();
        $this->assertGreaterThanOrEqual(2, count($response->json('data')));

        $ids = collect($response->json('data'))->pluck('id')->toArray();
        $this->assertContains($e1->id, $ids);
        $this->assertContains($e2->id, $ids);
    }

    public function test_delete_estimate()
    {
        $this->actingAs($this->user);

        $estimate = $this->createEstimate();

        $response = $this->deleteJson("/api/estimates/{$estimate->id}");
        $response->assertOk();

        $this->assertNull(Estimate::find($estimate->id));
    }

    public function test_show_estimate()
    {
        $this->actingAs($this->user);

        $estimate = $this->createEstimate();

        $response = $this->getJson("/api/estimates/{$estimate->id}");
        $response->assertOk();
        $this->assertEquals($estimate->id, $response->json('data.id'));
    }

    public function test_services_only_creates_jo_only_no_so()
    {
        $this->actingAs($this->user);

        $estimate = $this->createEstimate(['status' => 'FOR APPROVAL', 'total_amount' => 800.00]);

        // Only service items, no parts/supplies
        EstimateItem::create([
            'id' => (string) Str::uuid(),
            'estimate_id' => $estimate->id,
            'item_type' => 'service',
            'service_id' => $this->serviceType->id,
            'quantity' => 1,
            'unit_price' => 800.00,
            'subtotal' => 800.00,
        ]);

        $response = $this->putJson("/api/estimates/{$estimate->id}", [
            'status' => 'APPROVED',
        ]);
        $response->assertOk();

        // Should have JO but no SO
        $jo = JobOrder::where('estimate_id', $estimate->id)->first();
        $this->assertNotNull($jo, 'Job Order should be created for services-only estimate');
        $this->assertEquals(1, JobOrderService::where('JobOrderID', $jo->id)->count());

        $so = SalesOrder::where('estimate_id', $estimate->id)->first();
        $this->assertNull($so, 'Sales Order should NOT be created for services-only estimate');
    }

    public function test_parts_only_creates_so_only_no_jo()
    {
        $this->actingAs($this->user);

        $estimate = $this->createEstimate(['status' => 'FOR APPROVAL', 'total_amount' => 1000.00]);

        // Only part items, no services
        EstimateItem::create([
            'id' => (string) Str::uuid(),
            'estimate_id' => $estimate->id,
            'item_type' => 'part',
            'product_id' => $this->product->id,
            'quantity' => 2,
            'unit_price' => 500.00,
            'subtotal' => 1000.00,
        ]);

        $response = $this->putJson("/api/estimates/{$estimate->id}", [
            'status' => 'APPROVED',
        ]);
        $response->assertOk();

        // Should have SO but no JO
        $so = SalesOrder::where('estimate_id', $estimate->id)->first();
        $this->assertNotNull($so, 'Sales Order should be created for parts-only estimate');

        $jo = JobOrder::where('estimate_id', $estimate->id)->first();
        $this->assertNull($jo, 'Job Order should NOT be created for parts-only estimate');
    }

    public function test_cancel_draft_estimate()
    {
        $this->actingAs($this->user);

        $estimate = $this->createEstimate(['status' => 'DRAFT']);

        $response = $this->putJson("/api/estimates/{$estimate->id}", [
            'status' => 'CANCELLED',
        ]);
        $response->assertOk();

        $estimate->refresh();
        $this->assertEquals('CANCELLED', $estimate->status);
    }

    public function test_cancel_for_approval_estimate()
    {
        $this->actingAs($this->user);

        $estimate = $this->createEstimate(['status' => 'FOR APPROVAL']);

        $response = $this->putJson("/api/estimates/{$estimate->id}", [
            'status' => 'CANCELLED',
        ]);
        $response->assertOk();

        $estimate->refresh();
        $this->assertEquals('CANCELLED', $estimate->status);
    }

    public function test_cancel_approved_estimate_cascades()
    {
        $this->actingAs($this->user);

        $estimate = $this->createEstimate(['status' => 'FOR APPROVAL', 'total_amount' => 1000.00]);

        // Add part + service items
        EstimateItem::create([
            'id' => (string) Str::uuid(),
            'estimate_id' => $estimate->id,
            'item_type' => 'part',
            'product_id' => $this->product->id,
            'quantity' => 2,
            'unit_price' => 500.00,
            'subtotal' => 1000.00,
        ]);

        EstimateItem::create([
            'id' => (string) Str::uuid(),
            'estimate_id' => $estimate->id,
            'item_type' => 'service',
            'service_id' => $this->serviceType->id,
            'quantity' => 1,
            'unit_price' => 800.00,
            'subtotal' => 800.00,
        ]);

        // Approve first
        $this->putJson("/api/estimates/{$estimate->id}", ['status' => 'APPROVED'])->assertOk();

        // Verify SO + JO exist
        $so = SalesOrder::where('estimate_id', $estimate->id)->first();
        $jo = JobOrder::where('estimate_id', $estimate->id)->first();
        $this->assertNotNull($so);
        $this->assertNotNull($jo);
        $this->assertEquals('APPROVED', $so->Status);

        // Now cancel
        $response = $this->putJson("/api/estimates/{$estimate->id}", [
            'status' => 'CANCELLED',
        ]);
        $response->assertOk();

        // Verify cascade
        $estimate->refresh();
        $this->assertEquals('CANCELLED', $estimate->status);

        $so->refresh();
        $this->assertEquals('CANCELLED', $so->Status);

        $jo->refresh();
        $joStatusName = \DB::connection('pgsql')
            ->table('Main.Status')
            ->where('id', $jo->status)
            ->value('name');
        $this->assertEquals('Cancelled', $joStatusName);
    }

    public function test_archive_draft_estimate()
    {
        $this->actingAs($this->user);

        $estimate = $this->createEstimate(['status' => 'DRAFT']);

        $response = $this->deleteJson("/api/estimates/{$estimate->id}");
        $response->assertOk();
        $this->assertStringContainsString('archived', $response->json('message'));

        // Should not appear in normal list
        $this->assertNull(Estimate::find($estimate->id));

        // Should appear in trashed list
        $this->assertNotNull(Estimate::onlyTrashed()->find($estimate->id));
    }

    public function test_cannot_archive_approved_estimate()
    {
        $this->actingAs($this->user);

        $estimate = $this->createEstimate(['status' => 'APPROVED']);

        $response = $this->deleteJson("/api/estimates/{$estimate->id}");
        $response->assertStatus(422);
        $this->assertStringContainsString('archived', $response->json('message'));
    }

    public function test_restore_archived_estimate()
    {
        $this->actingAs($this->user);

        $estimate = $this->createEstimate(['status' => 'DRAFT']);
        $estimate->delete();

        $this->assertNull(Estimate::find($estimate->id));
        $this->assertNotNull(Estimate::onlyTrashed()->find($estimate->id));

        $response = $this->patchJson("/api/estimates/{$estimate->id}/restore");
        $response->assertOk();
        $this->assertStringContainsString('restored', $response->json('message'));

        $this->assertNotNull(Estimate::find($estimate->id));
    }

    public function test_force_delete_archived_estimate()
    {
        $this->actingAs($this->user);

        $estimate = $this->createEstimate(['status' => 'DRAFT']);

        // Add an item
        EstimateItem::create([
            'id' => (string) Str::uuid(),
            'estimate_id' => $estimate->id,
            'item_type' => 'service',
            'service_id' => $this->serviceType->id,
            'quantity' => 1,
            'unit_price' => 500.00,
            'subtotal' => 500.00,
        ]);

        // Soft-delete first
        $estimate->delete();
        $this->assertNotNull(Estimate::onlyTrashed()->find($estimate->id));

        // Force delete
        $response = $this->deleteJson("/api/estimates/{$estimate->id}/force");
        $response->assertOk();
        $this->assertStringContainsString('permanently deleted', $response->json('message'));

        // Should be completely gone
        $this->assertNull(Estimate::withTrashed()->find($estimate->id));
        $this->assertEquals(0, \App\Domains\Estimate\Domain\Models\EstimateItem::where('estimate_id', $estimate->id)->count());
    }

    public function test_paginated_list()
    {
        $this->actingAs($this->user);

        $e1 = $this->createEstimate(['status' => 'DRAFT']);
        $e2 = $this->createEstimate(['status' => 'FOR APPROVAL']);

        $response = $this->getJson('/api/estimates?per_page=2&page=1');
        $response->assertOk();
        $this->assertCount(2, $response->json('data'));
        $this->assertGreaterThanOrEqual(2, $response->json('meta.total'));
        $this->assertGreaterThanOrEqual(1, $response->json('meta.last_page'));

        // Verify our estimates are in the results
        $ids = collect($response->json('data'))->pluck('id')->toArray();
        $this->assertContains($e1->id, $ids);
        $this->assertContains($e2->id, $ids);
    }

    /* ================================================================
     *  SCENARIO TESTS — CANCEL / DOWNPAYMENT / TENTATIVE / SYNC
     * ================================================================ */

    public function test_cancel_approved_with_downpayment_estimate()
    {
        $this->actingAs($this->user);

        $estimate = $this->createEstimate(['status' => 'FOR APPROVAL', 'total_amount' => 1000.00, 'downpayment_amount' => 200.00]);

        EstimateItem::create([
            'id' => (string) Str::uuid(),
            'estimate_id' => $estimate->id,
            'item_type' => 'part',
            'product_id' => $this->product->id,
            'quantity' => 2,
            'unit_price' => 500.00,
            'subtotal' => 1000.00,
        ]);

        // Approve
        $this->putJson("/api/estimates/{$estimate->id}", ['status' => 'APPROVED'])->assertOk();

        $estimate->refresh();
        $this->assertEquals('APPROVED', $estimate->status);
        $this->assertEquals(200.00, $estimate->downpayment_amount);

        // Cancel — should now succeed with APPROVED + downpayment
        $response = $this->putJson("/api/estimates/{$estimate->id}", ['status' => 'CANCELLED']);
        $response->assertOk();

        $estimate->refresh();
        $this->assertEquals('CANCELLED', $estimate->status);

        // Linked SO should be cancelled
        $so = SalesOrder::where('estimate_id', $estimate->id)->first();
        $this->assertNotNull($so);
        $this->assertEquals('CANCELLED', $so->Status);
    }

    public function test_tentative_items_not_copied_to_so_on_approval()
    {
        $this->actingAs($this->user);

        $estimate = $this->createEstimate(['status' => 'FOR APPROVAL', 'total_amount' => 1500.00]);

        // Confirmed part
        EstimateItem::create([
            'id' => (string) Str::uuid(),
            'estimate_id' => $estimate->id,
            'item_type' => 'part',
            'product_id' => $this->product->id,
            'quantity' => 2,
            'unit_price' => 500.00,
            'subtotal' => 1000.00,
            'is_tentative' => false,
        ]);

        // Tentative part (same product, different line)
        $product2 = Product::create([
            'id' => (string) Str::uuid(),
            'SKU' => 'PROD-002',
            'name' => 'Oil Filter',
            'item_type' => 'part',
            'conversion_factor' => 1,
            'selling_price' => 250.00,
        ]);
        EstimateItem::create([
            'id' => (string) Str::uuid(),
            'estimate_id' => $estimate->id,
            'item_type' => 'part',
            'product_id' => $product2->id,
            'quantity' => 2,
            'unit_price' => 250.00,
            'subtotal' => 500.00,
            'is_tentative' => true,
        ]);

        // Approve
        $this->putJson("/api/estimates/{$estimate->id}", ['status' => 'APPROVED'])->assertOk();

        // Verify SO only has confirmed item
        $so = SalesOrder::where('estimate_id', $estimate->id)->first();
        $this->assertNotNull($so);
        $soItems = SalesOrderItem::where('SalesOrderID', $so->id)->get();
        $this->assertCount(1, $soItems);
        $this->assertEquals($this->product->id, $soItems->first()->ProductID);
    }

    public function test_estimate_with_supplies_only_creates_so()
    {
        $this->actingAs($this->user);

        $estimate = $this->createEstimate(['status' => 'FOR APPROVAL', 'total_amount' => 500.00]);

        // Create a supply product
        $supplyProduct = Product::create([
            'id' => (string) Str::uuid(),
            'SKU' => 'SUP-001',
            'name' => 'Brake Fluid',
            'item_type' => 'supply',
            'conversion_factor' => 1,
            'selling_price' => 500.00,
        ]);

        Inventory::create([
            'productID' => $supplyProduct->id,
            'product_supplier_id' => $this->productSupplier->id,
            'quantity_on_hand' => 10,
            'reserved_quantity' => 0,
            'sell_price' => 500.00,
            'location_id' => $this->locationId,
        ]);

        EstimateItem::create([
            'id' => (string) Str::uuid(),
            'estimate_id' => $estimate->id,
            'item_type' => 'supply',
            'product_id' => $supplyProduct->id,
            'quantity' => 1,
            'unit_price' => 500.00,
            'subtotal' => 500.00,
        ]);

        $this->putJson("/api/estimates/{$estimate->id}", ['status' => 'APPROVED'])->assertOk();

        // Supplies go to SO
        $so = SalesOrder::where('estimate_id', $estimate->id)->first();
        $this->assertNotNull($so, 'SO should be created for supplies-only estimate');

        // No JO for supplies
        $jo = JobOrder::where('estimate_id', $estimate->id)->first();
        $this->assertNull($jo, 'JO should NOT be created for supplies-only estimate');
    }

    public function test_update_estimate_after_approval_syncs_to_so()
    {
        $this->actingAs($this->user);

        $estimate = $this->createEstimate(['status' => 'FOR APPROVAL', 'total_amount' => 500.00]);

        // 1 confirmed part
        EstimateItem::create([
            'id' => (string) Str::uuid(),
            'estimate_id' => $estimate->id,
            'item_type' => 'part',
            'product_id' => $this->product->id,
            'quantity' => 1,
            'unit_price' => 500.00,
            'subtotal' => 500.00,
        ]);

        // Approve → SO with 1 item
        $this->putJson("/api/estimates/{$estimate->id}", ['status' => 'APPROVED'])->assertOk();

        $so = SalesOrder::where('estimate_id', $estimate->id)->first();
        $this->assertEquals(1, SalesOrderItem::where('SalesOrderID', $so->id)->count());

        // Add a second confirmed part to estimate
        $product2 = Product::create([
            'id' => (string) Str::uuid(),
            'SKU' => 'PROD-002',
            'name' => 'Oil Filter',
            'item_type' => 'part',
            'conversion_factor' => 1,
            'selling_price' => 250.00,
        ]);

        Inventory::create([
            'productID' => $product2->id,
            'product_supplier_id' => $this->productSupplier->id,
            'quantity_on_hand' => 5,
            'reserved_quantity' => 0,
            'sell_price' => 250.00,
            'location_id' => $this->locationId,
        ]);

        $this->putJson("/api/estimates/{$estimate->id}", [
            'total_amount' => 750.00,
            'items' => [
                [
                    'item_type' => 'part',
                    'product_id' => $this->product->id,
                    'quantity' => 1,
                    'unit_price' => 500.00,
                    'subtotal' => 500.00,
                ],
                [
                    'item_type' => 'part',
                    'product_id' => $product2->id,
                    'quantity' => 1,
                    'unit_price' => 250.00,
                    'subtotal' => 250.00,
                ],
            ],
        ])->assertOk();

        // SO should now have 2 items
        $soItems = SalesOrderItem::where('SalesOrderID', $so->id)->get();
        $this->assertCount(2, $soItems);
    }

    public function test_estimate_with_zero_items_approval()
    {
        $this->actingAs($this->user);

        $estimate = $this->createEstimate(['status' => 'FOR APPROVAL', 'total_amount' => 0.00]);

        // Approve with no items
        $response = $this->putJson("/api/estimates/{$estimate->id}", ['status' => 'APPROVED']);
        $response->assertOk();

        $estimate->refresh();
        $this->assertEquals('APPROVED', $estimate->status);

        // No SO, no JO
        $this->assertNull(SalesOrder::where('estimate_id', $estimate->id)->first());
        $this->assertNull(JobOrder::where('estimate_id', $estimate->id)->first());
    }

    public function test_notes_persist_through_estimate_lifecycle()
    {
        $this->actingAs($this->user);

        $estimate = $this->createEstimate(['status' => 'DRAFT', 'total_amount' => 500.00]);

        // Add item + notes
        $this->putJson("/api/estimates/{$estimate->id}", [
            'notes' => 'Customer wants premium oil',
            'items' => [
                [
                    'item_type' => 'part',
                    'product_id' => $this->product->id,
                    'quantity' => 1,
                    'unit_price' => 500.00,
                    'subtotal' => 500.00,
                ],
            ],
        ])->assertOk();

        $estimate->refresh();
        $this->assertEquals('Customer wants premium oil', $estimate->notes);

        // Approve → notes should persist
        $this->putJson("/api/estimates/{$estimate->id}", ['status' => 'APPROVED'])->assertOk();
        $estimate->refresh();
        $this->assertEquals('Customer wants premium oil', $estimate->notes);
    }

    public function test_cannot_cancel_already_cancelled_estimate()
    {
        $this->actingAs($this->user);

        $estimate = $this->createEstimate(['status' => 'DRAFT']);

        // Cancel once
        $this->putJson("/api/estimates/{$estimate->id}", ['status' => 'CANCELLED'])->assertOk();

        // Cancel again — should fail
        $response = $this->putJson("/api/estimates/{$estimate->id}", ['status' => 'CANCELLED']);
        $response->assertStatus(422);
    }

    public function test_estimate_list_search_by_customer_name()
    {
        $this->actingAs($this->user);

        $estimate = $this->createEstimate(['status' => 'DRAFT']);

        $response = $this->getJson('/api/estimates?search=' . urlencode('Jane'));
        $response->assertOk();
        $ids = collect($response->json('data'))->pluck('id')->toArray();
        $this->assertContains($estimate->id, $ids);
    }

    public function test_estimate_list_filter_by_status()
    {
        $this->actingAs($this->user);

        $e1 = $this->createEstimate(['status' => 'DRAFT']);
        $e2 = $this->createEstimate(['status' => 'FOR APPROVAL']);

        $response = $this->getJson('/api/estimates?status=DRAFT');
        $response->assertOk();
        $ids = collect($response->json('data'))->pluck('id')->toArray();
        $this->assertContains($e1->id, $ids);
        $this->assertNotContains($e2->id, $ids);
    }

    public function test_custom_service_flows_to_jo_on_approval()
    {
        $this->actingAs($this->user);

        $estimate = $this->createEstimate(['status' => 'FOR APPROVAL', 'total_amount' => 0.00]);

        // Custom service (no service_id)
        EstimateItem::create([
            'id' => (string) Str::uuid(),
            'estimate_id' => $estimate->id,
            'item_type' => 'service',
            'custom_name' => 'Custom Diagnostic',
            'quantity' => 1,
            'unit_price' => 500.00,
            'subtotal' => 500.00,
        ]);

        $this->putJson("/api/estimates/{$estimate->id}", ['status' => 'APPROVED'])->assertOk();

        // JO created WITH custom service
        $jo = JobOrder::where('estimate_id', $estimate->id)->first();
        $this->assertNotNull($jo, 'JO should be created for custom service');

        $services = JobOrderService::where('JobOrderID', $jo->id)->get();
        $this->assertCount(1, $services);
        $this->assertEquals('Custom Diagnostic', $services->first()->custom_name);
        $this->assertNull($services->first()->ServiceID);
    }

    public function test_custom_part_flows_to_so_on_approval()
    {
        $this->actingAs($this->user);

        $estimate = $this->createEstimate(['status' => 'FOR APPROVAL', 'total_amount' => 0.00]);

        // Custom part (no product_id)
        EstimateItem::create([
            'id' => (string) Str::uuid(),
            'estimate_id' => $estimate->id,
            'item_type' => 'part',
            'custom_name' => 'Custom Gasket Set',
            'quantity' => 1,
            'unit_price' => 300.00,
            'subtotal' => 300.00,
        ]);

        $this->putJson("/api/estimates/{$estimate->id}", ['status' => 'APPROVED'])->assertOk();

        // SO created WITH custom part
        $so = SalesOrder::where('estimate_id', $estimate->id)->first();
        $this->assertNotNull($so, 'SO should be created for custom part');

        $items = SalesOrderItem::where('SalesOrderID', $so->id)->get();
        $this->assertCount(1, $items);
        $this->assertEquals('Custom Gasket Set', $items->first()->custom_name);
        $this->assertNull($items->first()->ProductID);
    }

    public function test_custom_items_flow_to_billing()
    {
        $this->actingAs($this->user);

        $estimate = $this->createEstimate(['status' => 'FOR APPROVAL', 'total_amount' => 800.00]);

        // Custom part
        EstimateItem::create([
            'id' => (string) Str::uuid(),
            'estimate_id' => $estimate->id,
            'item_type' => 'part',
            'custom_name' => 'Custom Brake Pad',
            'quantity' => 1,
            'unit_price' => 500.00,
            'subtotal' => 500.00,
        ]);

        // Custom service
        EstimateItem::create([
            'id' => (string) Str::uuid(),
            'estimate_id' => $estimate->id,
            'item_type' => 'service',
            'custom_name' => 'Custom Diagnostic',
            'quantity' => 1,
            'unit_price' => 300.00,
            'subtotal' => 300.00,
        ]);

        // Approve
        $this->putJson("/api/estimates/{$estimate->id}", ['status' => 'APPROVED'])->assertOk();

        $so = SalesOrder::where('estimate_id', $estimate->id)->first();
        $jo = JobOrder::where('estimate_id', $estimate->id)->first();
        $this->assertNotNull($so);
        $this->assertNotNull($jo);

        // Start JO → complete → SO completed → billing
        $this->patchJson("/api/job-orders/{$jo->id}/status", ['status' => 'In Progress'])->assertOk();
        $this->patchJson("/api/job-orders/{$jo->id}/status", ['status' => 'Completed'])->assertOk();

        // Verify billing items have custom names
        $bill = \App\Domains\Billing\Domain\Models\BillingStatement::where('SOID', $so->id)
            ->where('status', '!=', 'Cancelled')->first();
        $this->assertNotNull($bill);

        $billItems = \App\Domains\Billing\Domain\Models\BillingStatementItem::where('BillingStatementID', $bill->id)->get();
        $names = $billItems->pluck('name')->toArray();
        $this->assertContains('Custom Brake Pad', $names);
        $this->assertContains('Custom Diagnostic', $names);
    }

    public function test_link_custom_item_to_product()
    {
        $this->actingAs($this->user);

        // Create SO with custom part
        $response = $this->postJson('/api/sales-orders', [
            'customer_id' => $this->customer->customer_id,
            'vehicle_id' => $this->vehicle->id,
            'type' => 'REPAIR',
            'items' => [
                [
                    'custom_name' => 'Custom Oil Filter',
                    'quantity' => 2,
                    'unit_price' => 250.00,
                    'needs_ordering' => true,
                ],
            ],
        ]);
        $response->assertStatus(201);
        $soId = $response->json('data.id');
        $itemId = SalesOrderItem::where('SalesOrderID', $soId)->first()->id;

        // Submit + Approve
        $this->postJson("/api/sales-orders/{$soId}/submit")->assertOk();
        $this->postJson("/api/sales-orders/{$soId}/approve")->assertOk();

        // Link custom item to real product
        $response = $this->postJson("/api/sales-orders/{$soId}/items/{$itemId}/link", [
            'product_id' => $this->product->id,
        ]);
        $response->assertOk();

        // Verify item is now linked
        $item = SalesOrderItem::find($itemId);
        $this->assertEquals($this->product->id, $item->ProductID);
        $this->assertEquals('Custom Oil Filter', $item->custom_name);
        $this->assertNotNull($item->TaxAtSale);
    }

    public function test_relink_custom_item_to_different_product()
    {
        $this->actingAs($this->user);

        // Create SO with custom part
        $response = $this->postJson('/api/sales-orders', [
            'customer_id' => $this->customer->customer_id,
            'vehicle_id' => $this->vehicle->id,
            'type' => 'REPAIR',
            'items' => [
                [
                    'custom_name' => 'Custom Radiator',
                    'quantity' => 1,
                    'unit_price' => 3000.00,
                    'needs_ordering' => true,
                ],
            ],
        ]);
        $soId = $response->json('data.id');
        $itemId = SalesOrderItem::where('SalesOrderID', $soId)->first()->id;

        $this->postJson("/api/sales-orders/{$soId}/submit")->assertOk();
        $this->postJson("/api/sales-orders/{$soId}/approve")->assertOk();

        // First link
        $this->postJson("/api/sales-orders/{$soId}/items/{$itemId}/link", [
            'product_id' => $this->product->id,
        ])->assertOk();

        $item = SalesOrderItem::find($itemId);
        $this->assertEquals($this->product->id, $item->ProductID);

        // Re-link to a different product — should succeed (overwrite)
        $product2 = Product::create([
            'id' => (string) Str::uuid(),
            'SKU' => 'PROD-002',
            'name' => 'Radiator Assy',
            'item_type' => 'part',
            'conversion_factor' => 1,
            'selling_price' => 3500.00,
        ]);

        $response = $this->postJson("/api/sales-orders/{$soId}/items/{$itemId}/link", [
            'product_id' => $product2->id,
        ]);
        $response->assertOk();

        $item->refresh();
        $this->assertEquals($product2->id, $item->ProductID);
    }

    public function test_create_so_with_custom_item()
    {
        $this->actingAs($this->user);

        $response = $this->postJson('/api/sales-orders', [
            'customer_id' => $this->customer->customer_id,
            'vehicle_id' => $this->vehicle->id,
            'type' => 'REPAIR',
            'items' => [
                [
                    'custom_name' => 'Custom Spark Plug',
                    'quantity' => 4,
                    'unit_price' => 150.00,
                    'needs_ordering' => true,
                ],
            ],
        ]);
        $response->assertStatus(201);

        $item = SalesOrderItem::where('SalesOrderID', $response->json('data.id'))->first();
        $this->assertEquals('Custom Spark Plug', $item->custom_name);
        $this->assertNull($item->ProductID);
        $this->assertTrue($item->needs_ordering);
        $this->assertEquals(600.00, $item->SubTotal);
    }

    public function test_link_custom_item_updates_price_and_needs_ordering()
    {
        $this->actingAs($this->user);

        // Create SO with custom part at ₱0
        $response = $this->postJson('/api/sales-orders', [
            'customer_id' => $this->customer->customer_id,
            'vehicle_id' => $this->vehicle->id,
            'type' => 'REPAIR',
            'items' => [
                [
                    'custom_name' => 'Custom Radiator',
                    'quantity' => 1,
                    'unit_price' => 0,
                    'needs_ordering' => true,
                ],
            ],
        ]);
        $response->assertStatus(201);
        $soId = $response->json('data.id');
        $itemId = SalesOrderItem::where('SalesOrderID', $soId)->first()->id;

        $this->postJson("/api/sales-orders/{$soId}/submit")->assertOk();
        $this->postJson("/api/sales-orders/{$soId}/approve")->assertOk();

        // Link to product with stock
        $this->postJson("/api/sales-orders/{$soId}/items/{$itemId}/link", [
            'product_id' => $this->product->id,
        ])->assertOk();

        $item = SalesOrderItem::find($itemId);
        $this->assertEquals($this->product->id, $item->ProductID);
        // Price should be pulled from product (selling_price = 500)
        $this->assertEquals(500.00, (float) $item->UnitPrice);
        $this->assertEquals(500.00, (float) $item->SubTotal);
        // needs_ordering should be false (10 in stock, need 1)
        $this->assertFalse($item->needs_ordering);
    }

    public function test_unlink_custom_item()
    {
        $this->actingAs($this->user);

        // Create SO with custom part
        $response = $this->postJson('/api/sales-orders', [
            'customer_id' => $this->customer->customer_id,
            'vehicle_id' => $this->vehicle->id,
            'type' => 'REPAIR',
            'items' => [
                [
                    'custom_name' => 'Custom Radiator',
                    'quantity' => 1,
                    'unit_price' => 3000.00,
                    'needs_ordering' => true,
                ],
            ],
        ]);
        $soId = $response->json('data.id');
        $itemId = SalesOrderItem::where('SalesOrderID', $soId)->first()->id;

        $this->postJson("/api/sales-orders/{$soId}/submit")->assertOk();
        $this->postJson("/api/sales-orders/{$soId}/approve")->assertOk();

        // Link
        $this->postJson("/api/sales-orders/{$soId}/items/{$itemId}/link", [
            'product_id' => $this->product->id,
        ])->assertOk();

        $item = SalesOrderItem::find($itemId);
        $this->assertNotNull($item->ProductID);
        // Original custom price should be stored
        $this->assertEquals(3000.00, (float) $item->original_custom_price);

        // Unlink
        $this->postJson("/api/sales-orders/{$soId}/items/{$itemId}/unlink")->assertOk();

        $item->refresh();
        $this->assertNull($item->ProductID);
        $this->assertNull($item->TaxAtSale);
        $this->assertTrue($item->needs_ordering);
        $this->assertEquals(0, $item->quantity_returned);
        // Custom name preserved, price restored to original
        $this->assertEquals('Custom Radiator', $item->custom_name);
        $this->assertEquals(3000.00, (float) $item->UnitPrice);
        $this->assertNull($item->original_custom_price);
    }

    public function test_cannot_unlink_non_custom_item()
    {
        $this->actingAs($this->user);

        // Create SO with regular product
        $response = $this->postJson('/api/sales-orders', [
            'customer_id' => $this->customer->customer_id,
            'vehicle_id' => $this->vehicle->id,
            'type' => 'REPAIR',
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 1,
                    'unit_price' => 500.00,
                ],
            ],
        ]);
        $soId = $response->json('data.id');
        $itemId = SalesOrderItem::where('SalesOrderID', $soId)->first()->id;

        $this->postJson("/api/sales-orders/{$soId}/submit")->assertOk();
        $this->postJson("/api/sales-orders/{$soId}/approve")->assertOk();

        // Try to unlink a non-custom item
        $this->postJson("/api/sales-orders/{$soId}/items/{$itemId}/unlink")->assertStatus(422);
    }

    /* ================================================================
     *  TENTATIVE-TO-CONFIRMED SYNC TESTS
     * ================================================================ */

    public function test_tentative_custom_part_creates_so_when_confirmed()
    {
        $this->actingAs($this->user);

        // Create estimate with only a tentative custom part
        $estimate = $this->createEstimate(['status' => 'FOR APPROVAL', 'total_amount' => 0.00]);

        $estItem = EstimateItem::create([
            'id' => (string) Str::uuid(),
            'estimate_id' => $estimate->id,
            'item_type' => 'part',
            'custom_name' => 'Custom Radiator',
            'quantity' => 1,
            'unit_price' => 3000.00,
            'subtotal' => 3000.00,
            'is_tentative' => true,
        ]);

        // Approve — no SO should be created (all items tentative)
        $this->putJson("/api/estimates/{$estimate->id}", ['status' => 'APPROVED'])->assertOk();

        $so = SalesOrder::where('estimate_id', $estimate->id)->first();
        $this->assertNull($so, 'No SO should exist when all items are tentative');

        // Edit estimate: toggle item to non-tentative
        $this->putJson("/api/estimates/{$estimate->id}", [
            'total_amount' => 3000.00,
            'items' => [
                [
                    'item_type' => 'part',
                    'custom_name' => 'Custom Radiator',
                    'quantity' => 1,
                    'unit_price' => 3000.00,
                    'subtotal' => 3000.00,
                    'needs_ordering' => true,
                    'is_tentative' => false,
                ],
            ],
        ])->assertOk();

        // Verify SO was created with the custom part
        $so = SalesOrder::where('estimate_id', $estimate->id)->first();
        $this->assertNotNull($so, 'SO should be created when tentative item becomes confirmed');
        $this->assertEquals('APPROVED', $so->Status);

        $items = SalesOrderItem::where('SalesOrderID', $so->id)->get();
        $this->assertCount(1, $items);
        $this->assertEquals('Custom Radiator', $items->first()->custom_name);
        $this->assertEquals(3000.00, (float) $items->first()->UnitPrice);
    }

    public function test_tentative_service_creates_jo_when_confirmed()
    {
        $this->actingAs($this->user);

        // Create estimate with only a tentative custom service
        $estimate = $this->createEstimate(['status' => 'FOR APPROVAL', 'total_amount' => 0.00]);

        EstimateItem::create([
            'id' => (string) Str::uuid(),
            'estimate_id' => $estimate->id,
            'item_type' => 'service',
            'custom_name' => 'Custom Diagnostic',
            'quantity' => 1,
            'unit_price' => 500.00,
            'subtotal' => 500.00,
            'is_tentative' => true,
        ]);

        // Approve — no JO should be created (all items tentative)
        $this->putJson("/api/estimates/{$estimate->id}", ['status' => 'APPROVED'])->assertOk();

        $jo = JobOrder::where('estimate_id', $estimate->id)->first();
        $this->assertNull($jo, 'No JO should exist when all items are tentative');

        // Edit estimate: toggle item to non-tentative
        $this->putJson("/api/estimates/{$estimate->id}", [
            'total_amount' => 500.00,
            'items' => [
                [
                    'item_type' => 'service',
                    'custom_name' => 'Custom Diagnostic',
                    'quantity' => 1,
                    'unit_price' => 500.00,
                    'subtotal' => 500.00,
                    'is_tentative' => false,
                ],
            ],
        ])->assertOk();

        // Verify JO was created with the custom service
        $jo = JobOrder::where('estimate_id', $estimate->id)->first();
        $this->assertNotNull($jo, 'JO should be created when tentative service becomes confirmed');

        $services = JobOrderService::where('JobOrderID', $jo->id)->get();
        $this->assertCount(1, $services);
        $this->assertEquals('Custom Diagnostic', $services->first()->custom_name);
        $this->assertEquals(500.00, (float) $services->first()->PriceAtSale);
    }

    public function test_mixed_tentative_items_creates_so_and_jo_when_confirmed()
    {
        $this->actingAs($this->user);

        // Create estimate with tentative part + tentative service
        $estimate = $this->createEstimate(['status' => 'FOR APPROVAL', 'total_amount' => 0.00]);

        EstimateItem::create([
            'id' => (string) Str::uuid(),
            'estimate_id' => $estimate->id,
            'item_type' => 'part',
            'custom_name' => 'Custom Part',
            'quantity' => 1,
            'unit_price' => 1000.00,
            'subtotal' => 1000.00,
            'is_tentative' => true,
        ]);

        EstimateItem::create([
            'id' => (string) Str::uuid(),
            'estimate_id' => $estimate->id,
            'item_type' => 'service',
            'service_id' => $this->serviceType->id,
            'quantity' => 1,
            'unit_price' => 800.00,
            'subtotal' => 800.00,
            'is_tentative' => true,
        ]);

        // Approve — no SO, no JO
        $this->putJson("/api/estimates/{$estimate->id}", ['status' => 'APPROVED'])->assertOk();
        $this->assertNull(SalesOrder::where('estimate_id', $estimate->id)->first());
        $this->assertNull(JobOrder::where('estimate_id', $estimate->id)->first());

        // Edit: confirm both items
        $this->putJson("/api/estimates/{$estimate->id}", [
            'total_amount' => 1800.00,
            'items' => [
                [
                    'item_type' => 'part',
                    'custom_name' => 'Custom Part',
                    'quantity' => 1,
                    'unit_price' => 1000.00,
                    'subtotal' => 1000.00,
                    'is_tentative' => false,
                ],
                [
                    'item_type' => 'service',
                    'service_id' => $this->serviceType->id,
                    'quantity' => 1,
                    'unit_price' => 800.00,
                    'subtotal' => 800.00,
                    'is_tentative' => false,
                ],
            ],
        ])->assertOk();

        // Verify both SO and JO created
        $so = SalesOrder::where('estimate_id', $estimate->id)->first();
        $this->assertNotNull($so, 'SO should be created for confirmed parts');
        $this->assertCount(1, SalesOrderItem::where('SalesOrderID', $so->id)->get());

        $jo = JobOrder::where('estimate_id', $estimate->id)->first();
        $this->assertNotNull($jo, 'JO should be created for confirmed services');
        $this->assertCount(1, JobOrderService::where('JobOrderID', $jo->id)->get());
    }

    public function test_link_custom_item_pulls_price_from_product_supplier()
    {
        $this->actingAs($this->user);

        // Create a ProductSupplier with a linked ProductPrice (selling price = 1200)
        $ps = \App\Domains\Supplier\Domain\Models\ProductSupplier::where('product_id', $this->product->id)->first();
        \App\Domains\Product\Domain\Models\ProductPrice::create([
            'id' => (string) Str::uuid(),
            'product_supplier_id' => $ps->id,
            'Price' => 1200.00,
            'Markup' => 0,
        ]);

        // Create SO with custom part at ₱0
        $response = $this->postJson('/api/sales-orders', [
            'customer_id' => $this->customer->customer_id,
            'vehicle_id' => $this->vehicle->id,
            'type' => 'REPAIR',
            'items' => [
                [
                    'custom_name' => 'Custom Radiator',
                    'quantity' => 1,
                    'unit_price' => 0,
                    'needs_ordering' => true,
                ],
            ],
        ]);
        $soId = $response->json('data.id');
        $itemId = SalesOrderItem::where('SalesOrderID', $soId)->first()->id;

        $this->postJson("/api/sales-orders/{$soId}/submit")->assertOk();
        $this->postJson("/api/sales-orders/{$soId}/approve")->assertOk();

        // Link — price should come from ProductSupplier.price.Price (1200)
        $this->postJson("/api/sales-orders/{$soId}/items/{$itemId}/link", [
            'product_id' => $this->product->id,
        ])->assertOk();

        $item = SalesOrderItem::find($itemId);
        $this->assertEquals(1200.00, (float) $item->UnitPrice);
        $this->assertEquals(1200.00, (float) $item->SubTotal);
    }

    public function test_so_jo_linked_when_so_created_after_jo_exists()
    {
        $this->actingAs($this->user);

        // Estimate: confirmed service + tentative custom part
        $estimate = $this->createEstimate(['status' => 'FOR APPROVAL', 'total_amount' => 0.00]);

        EstimateItem::create([
            'id' => (string) Str::uuid(),
            'estimate_id' => $estimate->id,
            'item_type' => 'service',
            'service_id' => $this->serviceType->id,
            'quantity' => 1,
            'unit_price' => 800.00,
            'subtotal' => 800.00,
        ]);

        EstimateItem::create([
            'id' => (string) Str::uuid(),
            'estimate_id' => $estimate->id,
            'item_type' => 'part',
            'custom_name' => 'Custom Radiator',
            'quantity' => 1,
            'unit_price' => 3000.00,
            'subtotal' => 3000.00,
            'is_tentative' => true,
        ]);

        // Approve → JO created (service), no SO (part is tentative)
        $this->putJson("/api/estimates/{$estimate->id}", ['status' => 'APPROVED'])->assertOk();

        $jo = JobOrder::where('estimate_id', $estimate->id)->first();
        $this->assertNotNull($jo);
        $this->assertNull($jo->SaleOrderID, 'JO should have no SO initially');
        $this->assertNull(SalesOrder::where('estimate_id', $estimate->id)->first());

        // Edit: confirm the custom part → SO should be created AND linked to existing JO
        $this->putJson("/api/estimates/{$estimate->id}", [
            'total_amount' => 3800.00,
            'items' => [
                [
                    'item_type' => 'service',
                    'service_id' => $this->serviceType->id,
                    'quantity' => 1,
                    'unit_price' => 800.00,
                    'subtotal' => 800.00,
                ],
                [
                    'item_type' => 'part',
                    'custom_name' => 'Custom Radiator',
                    'quantity' => 1,
                    'unit_price' => 3000.00,
                    'subtotal' => 3000.00,
                    'needs_ordering' => true,
                    'is_tentative' => false,
                ],
            ],
        ])->assertOk();

        // Verify SO created
        $so = SalesOrder::where('estimate_id', $estimate->id)->first();
        $this->assertNotNull($so, 'SO should be created');

        // Verify SO and JO are linked
        $jo->refresh();
        $this->assertEquals($so->id, $jo->SaleOrderID, 'JO should be linked to SO');
        $this->assertEquals($jo->id, $so->job_order_id, 'SO should be linked to JO');
    }

    public function test_unlink_resets_zero_price_to_zero()
    {
        $this->actingAs($this->user);

        // Create SO with custom part at ₱0
        $response = $this->postJson('/api/sales-orders', [
            'customer_id' => $this->customer->customer_id,
            'vehicle_id' => $this->vehicle->id,
            'type' => 'REPAIR',
            'items' => [
                [
                    'custom_name' => 'Custom Radiator',
                    'quantity' => 1,
                    'unit_price' => 0,
                    'needs_ordering' => true,
                ],
            ],
        ]);
        $soId = $response->json('data.id');
        $itemId = SalesOrderItem::where('SalesOrderID', $soId)->first()->id;

        $this->postJson("/api/sales-orders/{$soId}/submit")->assertOk();
        $this->postJson("/api/sales-orders/{$soId}/approve")->assertOk();

        // Link — price pulled from inventory
        $this->postJson("/api/sales-orders/{$soId}/items/{$itemId}/link", [
            'product_id' => $this->product->id,
        ])->assertOk();

        $item = SalesOrderItem::find($itemId);
        $this->assertGreaterThan(0, (float) $item->UnitPrice);
        $this->assertNull($item->original_custom_price, 'No original price to store (was ₱0)');

        // Unlink — price should go back to ₱0
        $this->postJson("/api/sales-orders/{$soId}/items/{$itemId}/unlink")->assertOk();

        $item->refresh();
        $this->assertEquals(0, (float) $item->UnitPrice);
        $this->assertEquals(0, (float) $item->SubTotal);
        $this->assertNull($item->original_custom_price);
    }

    public function test_mileage_syncs_to_so_on_estimate_edit()
    {
        $this->actingAs($this->user);

        // Create estimate with mileage + part item
        $estimate = $this->createEstimate(['status' => 'FOR APPROVAL', 'total_amount' => 1000.00, 'mileage' => 12345]);

        EstimateItem::create([
            'id' => (string) Str::uuid(),
            'estimate_id' => $estimate->id,
            'item_type' => 'part',
            'product_id' => $this->product->id,
            'quantity' => 2,
            'unit_price' => 500.00,
            'subtotal' => 1000.00,
        ]);

        // Approve → SO gets mileage
        $this->putJson("/api/estimates/{$estimate->id}", ['status' => 'APPROVED'])->assertOk();

        $so = SalesOrder::where('estimate_id', $estimate->id)->first();
        $this->assertNotNull($so);
        $this->assertEquals(12345, (int) $so->mileage);

        // Edit estimate mileage to 12346
        $this->putJson("/api/estimates/{$estimate->id}", [
            'mileage' => 12346,
            'items' => [
                [
                    'item_type' => 'part',
                    'product_id' => $this->product->id,
                    'quantity' => 2,
                    'unit_price' => 500.00,
                    'subtotal' => 1000.00,
                ],
            ],
        ])->assertOk();

        // SO mileage should now be 12346
        $so->refresh();
        $this->assertEquals(12346, (int) $so->mileage);

        // Estimate mileage should also be 12346
        $estimate->refresh();
        $this->assertEquals(12346, (int) $estimate->mileage);
    }
}
