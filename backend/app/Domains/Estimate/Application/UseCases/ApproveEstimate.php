<?php

namespace App\Domains\Estimate\Application\UseCases;

use App\Domains\Estimate\Domain\Models\Estimate;
use App\Domains\SalesOrder\Domain\Models\SalesOrder;
use App\Domains\SalesOrder\Domain\Models\SalesOrderItem;
use App\Domains\JobOrder\Domain\Models\JobOrder;
use App\Domains\JobOrder\Domain\Models\JobOrderService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class ApproveEstimate
{
    public function execute(string $estimateId, ?string $userId = null): array
    {
        return DB::transaction(function () use ($estimateId, $userId) {
            $estimate = Estimate::with('items')->lockForUpdate()->findOrFail($estimateId);

            // Guard: if SO or JO already exists for this estimate, return existing records
            $existingSO = SalesOrder::where('estimate_id', $estimateId)->first();
            $existingJO = $existingSO
                ? JobOrder::where('SaleOrderID', $existingSO->id)->first()
                : JobOrder::where('estimate_id', $estimateId)->first();

            if ($existingSO || $existingJO) {
                return [
                    'estimate' => $estimate,
                    'salesOrder' => $existingSO?->load(['items.product', 'customer', 'vehicle']),
                    'jobOrder' => $existingJO?->load(['services.serviceType', 'vehicle']),
                ];
            }

            $authUserId = auth()->user()?->id ?? $userId;

            // Resolve employeeID for the SO creator field (FK → Employees.id)
            $employeeId = $authUserId ? (auth()->user() ? auth()->user()->employeeID : null) : null;
            if (!$employeeId) {
                $firstEmployee = DB::table('Main.Employees')->first();
                $employeeId = $firstEmployee?->id;
            }

            // ── Classify estimate items ──────────────────────────────
            // Tentative items are NOT copied to SO/JO — they stay on the estimate
            // until the customer confirms them via "Add Item from Estimate" on the SO.
            $partSupplyItems = [];
            $serviceItems = [];
            $totalParts = 0.0;

            foreach ($estimate->items as $estItem) {
                // Skip tentative items — customer hasn't confirmed them yet
                if (!empty($estItem->is_tentative)) {
                    continue;
                }

                if (in_array($estItem->item_type, ['part', 'supply'], true)) {
                    $quantity = (int) ($estItem->quantity ?? 1);
                    $unitPrice = (float) ($estItem->unit_price ?? 0);
                    $subtotal = round($quantity * $unitPrice, 2);

                    $partSupplyItems[] = [
                        'product_id' => $estItem->product_id,
                        'custom_name' => $estItem->custom_name,
                        'quantity' => $quantity,
                        'unit_price' => $unitPrice,
                        'subtotal' => $subtotal,
                        'needs_ordering' => $estItem->needs_ordering ?? false,
                    ];

                    $totalParts += $subtotal;
                } elseif ($estItem->item_type === 'service') {
                    $serviceItems[] = $estItem;
                }
            }

            $salesOrder = null;
            $jobOrder = null;

            // Set estimate status to APPROVED
            $estimate->update([
                'status' => 'APPROVED',
                'approved_by' => $authUserId,
            ]);

            // ── 1. Create Sales Order (only if parts/supplies exist) ──
            if (!empty($partSupplyItems)) {
                $maxRetries = 10;
                $attempt = 0;
                do {
                    $soNumber = 'SO-' . now()->format('ymd') . '-' . random_int(1000, 9999);
                    $attempt++;
                } while (SalesOrder::withTrashed()->where('so_number', $soNumber)->exists() && $attempt < $maxRetries);

                if ($attempt >= $maxRetries) {
                    throw new RuntimeException('Failed to generate unique SO number after ' . $maxRetries . ' attempts.', 500);
                }

                $salesOrder = SalesOrder::create([
                    'id' => (string) Str::uuid(),
                    'so_number' => $soNumber,
                    'estimate_id' => $estimateId,
                    'customerID' => $estimate->customer_id,
                    'vehicle_id' => $estimate->vehicle_id,
                    'employee' => $employeeId,
                    'type' => 'REPAIR',
                    'mileage' => $estimate->mileage,
                    'Total' => $totalParts,
                    'Balance' => $totalParts,
                    'Status' => 'APPROVED',
                    'submitted_by' => $authUserId,
                    'submitted_at' => now(),
                    'approved_by' => $authUserId,
                    'approved_at' => now(),
                ]);

                foreach ($partSupplyItems as $item) {
                    $taxAtSale = 'NON_VAT';
                    if (!empty($item['product_id'])) {
                        $ps = \App\Domains\Supplier\Domain\Models\ProductSupplier::where('product_id', $item['product_id'])->first();
                        $taxAtSale = $ps && $ps->is_vat ? 'VAT' : 'NON_VAT';
                    }

                    SalesOrderItem::create([
                        'id' => (string) Str::uuid(),
                        'SalesOrderID' => $salesOrder->id,
                        'ProductID' => $item['product_id'],
                        'custom_name' => $item['custom_name'] ?? null,
                        'quantity' => $item['quantity'],
                        'UnitPrice' => $item['unit_price'],
                        'SubTotal' => $item['subtotal'],
                        'CostAtSale' => 0.00,
                        'TaxAtSale' => $taxAtSale,
                        'needs_ordering' => $item['needs_ordering'],
                    ]);
                }
            }

            // ── 2. Create Job Order (only if services exist) ──────────
            if (!empty($serviceItems)) {
                $pendingStatusId = $this->getStatusId('Pending');
                $joNumber = JobOrder::generateJoNumber();

                $jobOrder = JobOrder::create([
                    'jo_number' => $joNumber,
                    'SaleOrderID' => $salesOrder?->id,
                    'estimate_id' => $estimateId,
                    'VehicleID' => '',
                    'TechnicianID' => null,
                    'date' => now(),
                    'status' => $pendingStatusId,
                    'vehicle_id_new' => $estimate->vehicle_id,
                ]);

                // Link SO back to JO (if SO exists)
                if ($salesOrder) {
                    $salesOrder->update(['job_order_id' => $jobOrder->id]);
                }

                // Create JO services from estimate service items
                foreach ($serviceItems as $estItem) {
                    $price = (float) ($estItem->unit_price ?? 0);

                    JobOrderService::create([
                        'JobOrderID' => $jobOrder->id,
                        'ServiceID' => $estItem->service_id,
                        'custom_name' => $estItem->custom_name,
                        'PriceAtSale' => $price,
                    ]);
                }
            }

            return [
                'estimate' => $estimate->fresh()->load([
                    'customer', 'vehicle', 'items',
                    'creator.employee', 'editor.employee', 'approver.employee',
                ]),
                'salesOrder' => $salesOrder?->load(['items.product', 'customer', 'vehicle']),
                'jobOrder' => $jobOrder?->load(['services.serviceType', 'vehicle']),
            ];
        });
    }

    private function getStatusId(string $name): string
    {
        $status = DB::connection('pgsql')
            ->table('Main.Status')
            ->where('name', $name)
            ->where('category', 'JOB_ORDER')
            ->first();

        if (!$status) {
            throw new RuntimeException("Status \"{$name}\" not found for JOB_ORDER category.");
        }

        return $status->id;
    }
}
