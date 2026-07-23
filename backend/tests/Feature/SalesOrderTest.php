<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Domains\Customer\Domain\Models\Customer;
use App\Domains\Customer\Domain\Models\CustomerVehicle;
use App\Domains\Product\Domain\Models\Product;
use App\Domains\Inventory\Domain\Models\Inventory;
use App\Domains\SalesOrder\Domain\Models\SalesOrder;
use App\Domains\SalesOrder\Domain\Models\SalesOrderItem;
use App\Domains\Billing\Domain\Models\BillingStatement;
use App\Domains\Billing\Domain\Models\BillingStatementItem;
use App\Domains\Auth\Domain\Models\User;
use App\Domains\Employee\Domain\Models\Employee;
use App\Domains\Supplier\Domain\Models\Supplier;
use App\Domains\Supplier\Domain\Models\ProductSupplier;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Str;

class SalesOrderTest extends TestCase
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

    protected function setUp(): void
    {
        parent::setUp();

        $this->employee = Employee::create([
            'id' => 99999,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'position' => 'Mechanic',
            'roleID' => 1,
        ]);

        $this->user = User::create([
            'username' => 'johndoe',
            'password_hash' => bcrypt('password'),
            'employeeID' => $this->employee->id,
        ]);

        $this->customer = Customer::create([
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'mobile_number' => '09123456789',
        ]);

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

        $this->product = Product::create([
            'id' => (string) Str::uuid(),
            'SKU' => 'PROD-001',
            'name' => 'Engine Oil 5W30',
            'item_type' => 'part',
            'conversion_factor' => 1,
            'selling_price' => 500.00,
        ]);

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

        $locationId = (string) Str::uuid();
        \Illuminate\Support\Facades\DB::table('Main.StockLocations')->insert([
            'id' => $locationId,
            'code' => 'MAIN',
            'name' => 'Main Warehouse',
            'is_active' => true,
        ]);

        $this->inventory = Inventory::create([
            'productID' => $this->product->id,
            'product_supplier_id' => $this->productSupplier->id,
            'quantity_on_hand' => 10,
            'reserved_quantity' => 0,
            'sell_price' => 500.00,
            'location_id' => $locationId,
        ]);
    }

    public function test_full_so_lifecycle_create_submit_approve_cancel()
    {
        $this->actingAs($this->user);

        $payload = [
            'customer_id' => $this->customer->customer_id,
            'vehicle_id' => $this->vehicle->id,
            'notes' => 'Test Sales Order',
            'type' => 'REPAIR',
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 2,
                    'unit_price' => 500.00,
                    'needs_ordering' => false,
                ]
            ]
        ];

        // 1. Create as DRAFT
        $response = $this->postJson('/api/sales-orders', $payload);
        $response->assertStatus(201);
        $orderId = $response->json('data.id');
        $this->assertNotNull($orderId);

        $order = SalesOrder::find($orderId);
        $this->assertEquals('DRAFT', $order->Status);
        $this->assertEquals(0, $this->inventory->fresh()->reserved_quantity);

        // 2. Submit
        $submitResponse = $this->postJson("/api/sales-orders/{$orderId}/submit");
        $submitResponse->assertOk();
        $order->refresh();
        $this->assertEquals('SUBMITTED', $order->Status);
        $this->assertNotNull($order->submitted_by);

        // 3. Approve (reserves stock)
        $approveResponse = $this->postJson("/api/sales-orders/{$orderId}/approve");
        $approveResponse->assertOk();
        $this->assertEquals(2, $this->inventory->fresh()->reserved_quantity);
        $order->refresh();
        $this->assertEquals('APPROVED', $order->Status);

        // 4. Cancel (releases stock)
        $cancelResponse = $this->postJson("/api/sales-orders/{$orderId}/cancel");
        $cancelResponse->assertOk();
        $this->assertEquals(0, $this->inventory->fresh()->reserved_quantity);
        $order->refresh();
        $this->assertEquals('CANCELLED', $order->Status);
        $this->assertNotNull($order->cancelled_by);
    }

    public function test_cannot_submit_non_draft()
    {
        $this->actingAs($this->user);

        $payload = [
            'customer_id' => $this->customer->customer_id,
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 1,
                    'unit_price' => 500.00,
                ]
            ]
        ];

        $response = $this->postJson('/api/sales-orders', $payload);
        $orderId = $response->json('data.id');

        // Submit once
        $this->postJson("/api/sales-orders/{$orderId}/submit")->assertOk();

        // Try to submit again — should fail
        $this->postJson("/api/sales-orders/{$orderId}/submit")->assertStatus(422);
    }

    public function test_cannot_approve_non_submitted()
    {
        $this->actingAs($this->user);

        $payload = [
            'customer_id' => $this->customer->customer_id,
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 1,
                    'unit_price' => 500.00,
                ]
            ]
        ];

        $response = $this->postJson('/api/sales-orders', $payload);
        $orderId = $response->json('data.id');

        // Try to approve DRAFT directly — should fail
        $this->postJson("/api/sales-orders/{$orderId}/approve")->assertStatus(422);
    }

    public function test_cannot_cancel_completed_order()
    {
        $this->actingAs($this->user);

        $payload = [
            'customer_id' => $this->customer->customer_id,
            'type' => 'REPAIR',
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 1,
                    'unit_price' => 500.00,
                ]
            ]
        ];

        $response = $this->postJson('/api/sales-orders', $payload);
        $orderId = $response->json('data.id');

        $this->postJson("/api/sales-orders/{$orderId}/submit")->assertOk();
        $this->postJson("/api/sales-orders/{$orderId}/approve")->assertOk();

        // Move to IN_PROGRESS manually
        SalesOrder::where('id', $orderId)->update(['Status' => 'IN_PROGRESS']);

        // Complete it
        $this->postJson("/api/sales-orders/{$orderId}/complete")->assertOk();

        // Try to cancel completed — should fail
        $this->postJson("/api/sales-orders/{$orderId}/cancel")->assertStatus(422);
    }

    public function test_update_only_when_draft()
    {
        $this->actingAs($this->user);

        $payload = [
            'customer_id' => $this->customer->customer_id,
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 1,
                    'unit_price' => 500.00,
                ]
            ]
        ];

        $response = $this->postJson('/api/sales-orders', $payload);
        $orderId = $response->json('data.id');

        // Update DRAFT — should succeed
        $this->putJson("/api/sales-orders/{$orderId}", [
            'notes' => 'Updated notes',
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 3,
                    'unit_price' => 500.00,
                ]
            ]
        ])->assertOk();

        // Submit
        $this->postJson("/api/sales-orders/{$orderId}/submit")->assertOk();

        // Try to update SUBMITTED — should fail
        $this->putJson("/api/sales-orders/{$orderId}", ['notes' => 'Fail'])->assertStatus(422);
    }

    public function test_soft_delete_and_restore()
    {
        $this->actingAs($this->user);

        $payload = [
            'customer_id' => $this->customer->customer_id,
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 1,
                    'unit_price' => 500.00,
                ]
            ]
        ];

        $response = $this->postJson('/api/sales-orders', $payload);
        $orderId = $response->json('data.id');

        // Soft delete DRAFT
        $this->deleteJson("/api/sales-orders/{$orderId}")->assertOk();
        $this->assertSoftDeleted('SalesOrder', ['id' => $orderId]);

        // Restore
        $this->patchJson("/api/sales-orders/{$orderId}/restore")->assertOk();
        $this->assertNotSoftDeleted('SalesOrder', ['id' => $orderId]);
    }

    public function test_cannot_delete_non_draft_cancelled()
    {
        $this->actingAs($this->user);

        $payload = [
            'customer_id' => $this->customer->customer_id,
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 1,
                    'unit_price' => 500.00,
                ]
            ]
        ];

        $response = $this->postJson('/api/sales-orders', $payload);
        $orderId = $response->json('data.id');

        $this->postJson("/api/sales-orders/{$orderId}/submit")->assertOk();

        // Try to delete SUBMITTED — should fail
        $this->deleteJson("/api/sales-orders/{$orderId}")->assertStatus(422);
    }

    public function test_list_with_pagination()
    {
        $this->actingAs($this->user);

        // Create 3 orders
        for ($i = 0; $i < 3; $i++) {
            $this->postJson('/api/sales-orders', [
                'customer_id' => $this->customer->customer_id,
                'items' => [
                    [
                        'product_id' => $this->product->id,
                        'quantity' => 1,
                        'unit_price' => 500.00,
                    ]
                ]
            ]);
        }

        $response = $this->getJson('/api/sales-orders?per_page=2');
        $response->assertOk();
        $response->assertJsonCount(2, 'data');
        $this->assertGreaterThanOrEqual(3, $response->json('pagination.total'));
    }

    public function test_search_by_so_number()
    {
        $this->actingAs($this->user);

        $response = $this->postJson('/api/sales-orders', [
            'customer_id' => $this->customer->customer_id,
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 1,
                    'unit_price' => 500.00,
                ]
            ]
        ]);

        $soNumber = $response->json('data.so_number');

        $searchResponse = $this->getJson("/api/sales-orders?search={$soNumber}");
        $searchResponse->assertOk();
        $searchResponse->assertJsonCount(1, 'data');
    }

    public function test_notes_update_persists()
    {
        $this->actingAs($this->user);

        $response = $this->postJson('/api/sales-orders', [
            'customer_id' => $this->customer->customer_id,
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 1,
                    'unit_price' => 500.00,
                ]
            ]
        ]);

        $orderId = $response->json('data.id');

        // Set notes
        $this->putJson("/api/sales-orders/{$orderId}", [
            'notes' => 'Updated remarks test',
        ])->assertOk();

        $order = SalesOrder::find($orderId);
        $this->assertEquals('Updated remarks test', $order->remarks);

        // Clear notes (empty string)
        $this->putJson("/api/sales-orders/{$orderId}", [
            'notes' => '',
        ])->assertOk();

        $order = SalesOrder::find($orderId);
        $this->assertEquals('', $order->remarks);

        // PATCH notes
        $this->patchJson("/api/sales-orders/{$orderId}", [
            'notes' => 'PATCH notes test',
        ])->assertOk();

        $order = SalesOrder::find($orderId);
        $this->assertEquals('PATCH notes test', $order->remarks);
    }

    public function test_void_and_reopen_restores_status()
    {
        $this->actingAs($this->user);

        // Create SO via API
        $payload = [
            'customer_id' => $this->customer->customer_id,
            'vehicle_id' => $this->vehicle->id,
            'notes' => 'Void Reopen Test',
            'type' => 'REPAIR',
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 2,
                    'unit_price' => 500.00,
                    'needs_ordering' => false,
                ]
            ]
        ];

        $response = $this->postJson('/api/sales-orders', $payload);
        $response->assertStatus(201);
        $soId = $response->json('data.id');

        // Submit + Approve
        $this->postJson("/api/sales-orders/{$soId}/submit")->assertOk();
        $this->postJson("/api/sales-orders/{$soId}/approve")->assertOk();

        // Verify reserved
        $this->inventory->refresh();
        $this->assertGreaterThan(0, $this->inventory->reserved_quantity);

        // Issue items
        $itemId = SalesOrderItem::where('SalesOrderID', $soId)->first()->id;
        $this->postJson("/api/sales-orders/{$soId}/issue", [
            'item_ids' => [$itemId],
        ])->assertOk();

        // Verify issued
        $item = SalesOrderItem::where('SalesOrderID', $soId)->first();
        $this->assertTrue($item->is_issued);

        // Void
        $this->postJson("/api/sales-orders/{$soId}/void")->assertOk();
        $so = SalesOrder::find($soId);
        $this->assertEquals('CANCELLED', $so->Status);

        // Verify stock was returned
        $item->refresh();
        $this->assertFalse($item->is_issued);

        // Reopen
        $this->postJson("/api/sales-orders/{$soId}/reopen")->assertOk();
        $so->refresh();
        $this->assertEquals('APPROVED', $so->Status);

        // Verify stock is re-reserved
        $this->inventory->refresh();
        $this->assertGreaterThan(0, $this->inventory->reserved_quantity);
    }

    public function test_needs_ordering_auto_clears_on_restock()
    {
        $this->actingAs($this->user);

        // Start with zero stock so item is flagged needs_ordering
        $this->inventory->update(['quantity_on_hand' => 0]);

        // Create SO via API
        $response = $this->postJson('/api/sales-orders', [
            'customer_id' => $this->customer->customer_id,
            'vehicle_id' => $this->vehicle->id,
            'type' => 'REPAIR',
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 2,
                    'unit_price' => 500.00,
                    'needs_ordering' => true,
                ]
            ]
        ]);
        $response->assertStatus(201);
        $soId = $response->json('data.id');

        // Submit + Approve
        $this->postJson("/api/sales-orders/{$soId}/submit")->assertOk();
        $this->postJson("/api/sales-orders/{$soId}/approve")->assertOk();

        // Verify item needs ordering
        $item = SalesOrderItem::where('SalesOrderID', $soId)->first();
        $this->assertTrue($item->needs_ordering);

        // Restock inventory (increase quantity_on_hand from 0 to 10)
        $this->inventory->update(['quantity_on_hand' => 10]);

        // Verify needs_ordering was auto-cleared by InventoryObserver
        $item->refresh();
        $this->assertFalse($item->needs_ordering);
    }

    public function test_needs_ordering_not_cleared_when_stock_insufficient()
    {
        $this->actingAs($this->user);

        // Start with zero stock
        $this->inventory->update(['quantity_on_hand' => 0]);

        // Create SO via API
        $response = $this->postJson('/api/sales-orders', [
            'customer_id' => $this->customer->customer_id,
            'vehicle_id' => $this->vehicle->id,
            'type' => 'REPAIR',
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 10,
                    'unit_price' => 500.00,
                    'needs_ordering' => true,
                ]
            ]
        ]);
        $response->assertStatus(201);
        $soId = $response->json('data.id');

        // Submit + Approve
        $this->postJson("/api/sales-orders/{$soId}/submit")->assertOk();
        $this->postJson("/api/sales-orders/{$soId}/approve")->assertOk();

        // Restock but not enough for the order (need 10, have 5)
        $this->inventory->update(['quantity_on_hand' => 5]);

        // Verify needs_ordering is NOT cleared (stock still insufficient)
        $item = SalesOrderItem::where('SalesOrderID', $soId)->first();
        $this->assertTrue($item->needs_ordering);
    }

    /* ================================================================
     *  SCENARIO TESTS — COUNTER / ISSUE / RETURN / VOID / COMPLETE
     * ================================================================ */

    public function test_counter_sale_full_flow()
    {
        $this->actingAs($this->user);

        $response = $this->postJson('/api/sales-orders', [
            'customer_id' => $this->customer->customer_id,
            'vehicle_id' => $this->vehicle->id,
            'type' => 'COUNTER',
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 2,
                    'unit_price' => 500.00,
                    'needs_ordering' => false,
                ],
            ],
        ]);
        $response->assertStatus(201);
        $soId = $response->json('data.id');

        // Submit
        $this->postJson("/api/sales-orders/{$soId}/submit")->assertOk();

        // Approve → counter auto-issues + creates billing
        $this->postJson("/api/sales-orders/{$soId}/approve")->assertOk();

        $so = SalesOrder::find($soId);
        $this->assertEquals('APPROVED', $so->Status);

        // Verify stock was deducted
        $this->inventory->refresh();
        $this->assertEquals(8, $this->inventory->quantity_on_hand);

        // Verify billing was created
        $bill = BillingStatement::where('SOID', $soId)->where('status', '!=', 'Cancelled')->first();
        $this->assertNotNull($bill, 'Counter sale should auto-create billing');
        $this->assertEquals(1000.00, $bill->Total);
    }

    public function test_issue_items_reduces_inventory()
    {
        $this->actingAs($this->user);

        $response = $this->postJson('/api/sales-orders', [
            'customer_id' => $this->customer->customer_id,
            'vehicle_id' => $this->vehicle->id,
            'type' => 'REPAIR',
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 3,
                    'unit_price' => 500.00,
                    'needs_ordering' => false,
                ],
            ],
        ]);
        $soId = $response->json('data.id');

        $this->postJson("/api/sales-orders/{$soId}/submit")->assertOk();
        $this->postJson("/api/sales-orders/{$soId}/approve")->assertOk();

        $this->inventory->refresh();
        $this->assertEquals(3, $this->inventory->reserved_quantity);

        // Issue
        $itemId = SalesOrderItem::where('SalesOrderID', $soId)->first()->id;
        $this->postJson("/api/sales-orders/{$soId}/issue", [
            'item_ids' => [$itemId],
        ])->assertOk();

        $this->inventory->refresh();
        $this->assertEquals(7, $this->inventory->quantity_on_hand);
        $this->assertEquals(0, $this->inventory->reserved_quantity);
    }

    public function test_issue_items_transitions_to_in_progress()
    {
        $this->actingAs($this->user);

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

        $this->postJson("/api/sales-orders/{$soId}/submit")->assertOk();
        $this->postJson("/api/sales-orders/{$soId}/approve")->assertOk();

        $itemId = SalesOrderItem::where('SalesOrderID', $soId)->first()->id;
        $this->postJson("/api/sales-orders/{$soId}/issue", [
            'item_ids' => [$itemId],
        ])->assertOk();

        $so = SalesOrder::find($soId);
        $this->assertEquals('IN_PROGRESS', $so->Status);
    }

    public function test_return_items_restores_inventory()
    {
        $this->actingAs($this->user);

        $response = $this->postJson('/api/sales-orders', [
            'customer_id' => $this->customer->customer_id,
            'vehicle_id' => $this->vehicle->id,
            'type' => 'REPAIR',
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 2,
                    'unit_price' => 500.00,
                ],
            ],
        ]);
        $soId = $response->json('data.id');

        $this->postJson("/api/sales-orders/{$soId}/submit")->assertOk();
        $this->postJson("/api/sales-orders/{$soId}/approve")->assertOk();

        $itemId = SalesOrderItem::where('SalesOrderID', $soId)->first()->id;
        $this->postJson("/api/sales-orders/{$soId}/issue", [
            'item_ids' => [$itemId],
        ])->assertOk();

        $this->inventory->refresh();
        $this->assertEquals(8, $this->inventory->quantity_on_hand);

        // Return
        $this->postJson("/api/sales-orders/{$soId}/return", [
            'returns' => [
                ['id' => $itemId, 'quantity' => 2],
            ],
        ])->assertOk();

        $this->inventory->refresh();
        $this->assertEquals(10, $this->inventory->quantity_on_hand);
    }

    public function test_cannot_return_more_than_issued()
    {
        $this->actingAs($this->user);

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

        $this->postJson("/api/sales-orders/{$soId}/submit")->assertOk();
        $this->postJson("/api/sales-orders/{$soId}/approve")->assertOk();

        $itemId = SalesOrderItem::where('SalesOrderID', $soId)->first()->id;
        $this->postJson("/api/sales-orders/{$soId}/issue", [
            'item_ids' => [$itemId],
        ])->assertOk();

        // Try to return 2 when only 1 was issued
        $response = $this->postJson("/api/sales-orders/{$soId}/return", [
            'returns' => [
                ['id' => $itemId, 'quantity' => 2],
            ],
        ]);
        $response->assertStatus(422);
    }

    public function test_start_work_transitions_to_in_progress()
    {
        $this->actingAs($this->user);

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

        $this->postJson("/api/sales-orders/{$soId}/submit")->assertOk();
        $this->postJson("/api/sales-orders/{$soId}/approve")->assertOk();
        $this->postJson("/api/sales-orders/{$soId}/start-work")->assertOk();

        $so = SalesOrder::find($soId);
        $this->assertEquals('IN_PROGRESS', $so->Status);
        $this->assertNotNull($so->started_by);
    }

    public function test_complete_so_creates_billing()
    {
        $this->actingAs($this->user);

        $response = $this->postJson('/api/sales-orders', [
            'customer_id' => $this->customer->customer_id,
            'vehicle_id' => $this->vehicle->id,
            'type' => 'REPAIR',
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 2,
                    'unit_price' => 500.00,
                ],
            ],
        ]);
        $soId = $response->json('data.id');

        $this->postJson("/api/sales-orders/{$soId}/submit")->assertOk();
        $this->postJson("/api/sales-orders/{$soId}/approve")->assertOk();
        $this->postJson("/api/sales-orders/{$soId}/start-work")->assertOk();
        $this->postJson("/api/sales-orders/{$soId}/complete")->assertOk();

        $so = SalesOrder::find($soId);
        $this->assertEquals('COMPLETED', $so->Status);

        // Billing created
        $bill = BillingStatement::where('SOID', $soId)->where('status', '!=', 'Cancelled')->first();
        $this->assertNotNull($bill);
        $this->assertEquals(1000.00, $bill->Total);

        // Billing items
        $billItems = BillingStatementItem::where('BillingStatementID', $bill->id)->get();
        $this->assertGreaterThanOrEqual(1, $billItems->count());
    }

    public function test_void_returns_correct_stock_quantity()
    {
        $this->actingAs($this->user);

        $response = $this->postJson('/api/sales-orders', [
            'customer_id' => $this->customer->customer_id,
            'vehicle_id' => $this->vehicle->id,
            'type' => 'REPAIR',
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 5,
                    'unit_price' => 500.00,
                ],
            ],
        ]);
        $soId = $response->json('data.id');

        $this->postJson("/api/sales-orders/{$soId}/submit")->assertOk();
        $this->postJson("/api/sales-orders/{$soId}/approve")->assertOk();

        $itemId = SalesOrderItem::where('SalesOrderID', $soId)->first()->id;

        // Issue all 5
        $this->postJson("/api/sales-orders/{$soId}/issue", [
            'item_ids' => [$itemId],
        ])->assertOk();

        $this->inventory->refresh();
        $this->assertEquals(5, $this->inventory->quantity_on_hand);

        // Item was partially returned (1 unit) before void
        $this->postJson("/api/sales-orders/{$soId}/return", [
            'returns' => [
                ['id' => $itemId, 'quantity' => 1],
            ],
        ])->assertOk();

        $this->inventory->refresh();
        $this->assertEquals(6, $this->inventory->quantity_on_hand);

        // Void → should return 4 (5 issued - 1 returned), not 5 (full qty)
        $this->postJson("/api/sales-orders/{$soId}/void")->assertOk();

        $this->inventory->refresh();
        $this->assertEquals(10, $this->inventory->quantity_on_hand);
    }

    public function test_reopen_cancelled_so_re_reserves_stock()
    {
        $this->actingAs($this->user);

        $response = $this->postJson('/api/sales-orders', [
            'customer_id' => $this->customer->customer_id,
            'vehicle_id' => $this->vehicle->id,
            'type' => 'REPAIR',
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 2,
                    'unit_price' => 500.00,
                    'needs_ordering' => false,
                ],
            ],
        ]);
        $soId = $response->json('data.id');

        $this->postJson("/api/sales-orders/{$soId}/submit")->assertOk();
        $this->postJson("/api/sales-orders/{$soId}/approve")->assertOk();

        $this->inventory->refresh();
        $this->assertEquals(2, $this->inventory->reserved_quantity);

        // Cancel
        $this->postJson("/api/sales-orders/{$soId}/cancel")->assertOk();
        $this->inventory->refresh();
        $this->assertEquals(0, $this->inventory->reserved_quantity);

        // Reopen
        $this->postJson("/api/sales-orders/{$soId}/reopen")->assertOk();
        $this->inventory->refresh();
        $this->assertEquals(2, $this->inventory->reserved_quantity);
    }

    public function test_reopen_completed_so_to_in_progress()
    {
        $this->actingAs($this->user);

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

        $this->postJson("/api/sales-orders/{$soId}/submit")->assertOk();
        $this->postJson("/api/sales-orders/{$soId}/approve")->assertOk();
        $this->postJson("/api/sales-orders/{$soId}/start-work")->assertOk();
        $this->postJson("/api/sales-orders/{$soId}/complete")->assertOk();

        $so = SalesOrder::find($soId);
        $this->assertEquals('COMPLETED', $so->Status);

        // Reopen
        $this->postJson("/api/sales-orders/{$soId}/reopen")->assertOk();
        $so->refresh();
        $this->assertEquals('IN_PROGRESS', $so->Status);
    }

    public function test_cannot_issue_needs_ordering_items()
    {
        $this->actingAs($this->user);

        $this->inventory->update(['quantity_on_hand' => 0]);

        $response = $this->postJson('/api/sales-orders', [
            'customer_id' => $this->customer->customer_id,
            'vehicle_id' => $this->vehicle->id,
            'type' => 'REPAIR',
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 2,
                    'unit_price' => 500.00,
                    'needs_ordering' => true,
                ],
            ],
        ]);
        $soId = $response->json('data.id');

        $this->postJson("/api/sales-orders/{$soId}/submit")->assertOk();
        $this->postJson("/api/sales-orders/{$soId}/approve")->assertOk();

        $itemId = SalesOrderItem::where('SalesOrderID', $soId)->first()->id;
        $response = $this->postJson("/api/sales-orders/{$soId}/issue", [
            'item_ids' => [$itemId],
        ]);
        $response->assertStatus(422);
    }

    public function test_cannot_issue_more_than_available_stock()
    {
        $this->actingAs($this->user);

        // Create SO for 10 items (all available stock)
        $response = $this->postJson('/api/sales-orders', [
            'customer_id' => $this->customer->customer_id,
            'vehicle_id' => $this->vehicle->id,
            'type' => 'REPAIR',
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 10,
                    'unit_price' => 500.00,
                    'needs_ordering' => false,
                ],
            ],
        ]);
        $soId = $response->json('data.id');

        $this->postJson("/api/sales-orders/{$soId}/submit")->assertOk();
        $this->postJson("/api/sales-orders/{$soId}/approve")->assertOk();

        // Reduce available stock (simulating another order consuming it)
        $this->inventory->update(['quantity_on_hand' => 3]);

        // Try to issue → should fail (only 3 available, need 10)
        $itemId = SalesOrderItem::where('SalesOrderID', $soId)->first()->id;
        $response = $this->postJson("/api/sales-orders/{$soId}/issue", [
            'item_ids' => [$itemId],
        ]);
        $response->assertStatus(422);
    }

    public function test_add_estimate_items_to_so()
    {
        $this->actingAs($this->user);

        // Create second product
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
            'location_id' => $this->inventory->location_id,
        ]);

        // Create estimate + items directly
        $estimate = \App\Domains\Estimate\Domain\Models\Estimate::create([
            'id' => (string) Str::uuid(),
            'customer_id' => $this->customer->customer_id,
            'vehicle_id' => $this->vehicle->id,
            'status' => 'FOR APPROVAL',
            'total_amount' => 500.00,
            'estimate_number' => 'EST-' . now()->format('ymd') . '-' . rand(1000, 9999),
            'created_by' => $this->user->id,
        ]);

        $estItem1 = \App\Domains\Estimate\Domain\Models\EstimateItem::create([
            'id' => (string) Str::uuid(),
            'estimate_id' => $estimate->id,
            'item_type' => 'part',
            'product_id' => $this->product->id,
            'quantity' => 1,
            'unit_price' => 500.00,
            'subtotal' => 500.00,
        ]);

        $estItem2 = \App\Domains\Estimate\Domain\Models\EstimateItem::create([
            'id' => (string) Str::uuid(),
            'estimate_id' => $estimate->id,
            'item_type' => 'part',
            'product_id' => $product2->id,
            'quantity' => 2,
            'unit_price' => 250.00,
            'subtotal' => 500.00,
        ]);

        // Approve estimate → creates SO with both parts
        $this->putJson("/api/estimates/{$estimate->id}", ['status' => 'APPROVED'])->assertOk();

        $so = SalesOrder::where('estimate_id', $estimate->id)->first();
        $this->assertNotNull($so);
        $initialCount = SalesOrderItem::where('SalesOrderID', $so->id)->count();
        $this->assertEquals(2, $initialCount, 'SO should have both estimate items after approval');

        // Add a THIRD estimate item AFTER approval (this one won't be on SO yet)
        $product3 = Product::create([
            'id' => (string) Str::uuid(),
            'SKU' => 'PROD-003',
            'name' => 'Air Filter',
            'item_type' => 'part',
            'conversion_factor' => 1,
            'selling_price' => 150.00,
        ]);
        Inventory::create([
            'productID' => $product3->id,
            'product_supplier_id' => $this->productSupplier->id,
            'quantity_on_hand' => 5,
            'reserved_quantity' => 0,
            'sell_price' => 150.00,
            'location_id' => $this->inventory->location_id,
        ]);

        $estItem3 = \App\Domains\Estimate\Domain\Models\EstimateItem::create([
            'id' => (string) Str::uuid(),
            'estimate_id' => $estimate->id,
            'item_type' => 'part',
            'product_id' => $product3->id,
            'quantity' => 1,
            'unit_price' => 150.00,
            'subtotal' => 150.00,
        ]);

        // Add third item from estimate
        $response = $this->postJson("/api/sales-orders/{$so->id}/add-items", [
            'estimate_item_ids' => [$estItem3->id],
        ]);
        $response->assertOk();

        $newCount = SalesOrderItem::where('SalesOrderID', $so->id)->count();
        $this->assertEquals(3, $newCount);
    }

    public function test_cannot_update_non_draft_so()
    {
        $this->actingAs($this->user);

        $response = $this->postJson('/api/sales-orders', [
            'customer_id' => $this->customer->customer_id,
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 1,
                    'unit_price' => 500.00,
                ],
            ],
        ]);
        $soId = $response->json('data.id');

        $this->postJson("/api/sales-orders/{$soId}/submit")->assertOk();

        $this->putJson("/api/sales-orders/{$soId}", [
            'notes' => 'Should fail',
        ])->assertStatus(422);
    }

    public function test_counter_sale_no_start_work()
    {
        $this->actingAs($this->user);

        $response = $this->postJson('/api/sales-orders', [
            'customer_id' => $this->customer->customer_id,
            'vehicle_id' => $this->vehicle->id,
            'type' => 'COUNTER',
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 1,
                    'unit_price' => 500.00,
                ],
            ],
        ]);
        $soId = $response->json('data.id');

        $this->postJson("/api/sales-orders/{$soId}/submit")->assertOk();
        $this->postJson("/api/sales-orders/{$soId}/approve")->assertOk();

        // Start work should fail for COUNTER
        $this->postJson("/api/sales-orders/{$soId}/start-work")->assertStatus(422);
    }

    public function test_complete_sales_order_records_completed_by()
    {
        $this->actingAs($this->user);

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

        $this->postJson("/api/sales-orders/{$soId}/submit")->assertOk();
        $this->postJson("/api/sales-orders/{$soId}/approve")->assertOk();
        $this->postJson("/api/sales-orders/{$soId}/start-work")->assertOk();
        $this->postJson("/api/sales-orders/{$soId}/complete")->assertOk();

        $so = SalesOrder::find($soId);
        $this->assertNotNull($so->completed_by, 'completed_by should be set');
        $this->assertEquals($this->user->id, $so->completed_by);
    }

    public function test_cannot_void_non_approved_so()
    {
        $this->actingAs($this->user);

        $response = $this->postJson('/api/sales-orders', [
            'customer_id' => $this->customer->customer_id,
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 1,
                    'unit_price' => 500.00,
                ],
            ],
        ]);
        $soId = $response->json('data.id');

        // DRAFT → void should fail
        $this->postJson("/api/sales-orders/{$soId}/void")->assertStatus(422);
    }

    public function test_cannot_issue_on_completed_so()
    {
        $this->actingAs($this->user);

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

        $this->postJson("/api/sales-orders/{$soId}/submit")->assertOk();
        $this->postJson("/api/sales-orders/{$soId}/approve")->assertOk();
        $this->postJson("/api/sales-orders/{$soId}/start-work")->assertOk();
        $this->postJson("/api/sales-orders/{$soId}/complete")->assertOk();

        $itemId = SalesOrderItem::where('SalesOrderID', $soId)->first()->id;
        $this->postJson("/api/sales-orders/{$soId}/issue", [
            'item_ids' => [$itemId],
        ])->assertStatus(422);
    }
}
