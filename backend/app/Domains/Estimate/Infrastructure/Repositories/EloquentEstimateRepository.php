<?php

namespace App\Domains\Estimate\Infrastructure\Repositories;

use App\Domains\Estimate\Domain\Models\Estimate;
use App\Domains\Estimate\Domain\Models\EstimateItem;
use App\Domains\Estimate\Domain\Repositories\EstimateRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EloquentEstimateRepository implements EstimateRepositoryInterface
{
    public function getPaginated(int $perPage, int $page, string $search, string $status, bool $archived): array
    {
        $query = Estimate::with(['customer', 'vehicle', 'items', 'creator.employee', 'editor.employee', 'approver.employee']);

        if ($archived) {
            $query->onlyTrashed();
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('estimate_number', 'ILIKE', "%{$search}%")
                  ->orWhereHas('customer', function ($cq) use ($search) {
                      $cq->where('first_name', 'ILIKE', "%{$search}%")
                         ->orWhere('last_name', 'ILIKE', "%{$search}%");
                  });
            });
        }

        if ($status && $status !== 'ALL') {
            $statuses = array_map('strtoupper', array_map('trim', explode(',', $status)));
            $query->whereIn(DB::raw("UPPER(status)"), $statuses);
        }

        $paginated = $query->orderByDesc('created_at')->paginate($perPage, ['*'], 'page', $page);

        return [
            'data' => $paginated->items(),
            'meta' => [
                'total' => $paginated->total(),
                'per_page' => $paginated->perPage(),
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
            ],
        ];
    }

    public function findById(string $id): ?Estimate
    {
        if (\Illuminate\Support\Str::isUuid($id)) {
            $estimate = Estimate::with(['customer', 'vehicle', 'items', 'creator.employee', 'editor.employee', 'approver.employee'])->find($id);
            if ($estimate) {
                return $estimate;
            }
        }

        return Estimate::with(['customer', 'vehicle', 'items', 'creator.employee', 'editor.employee', 'approver.employee'])
            ->where('estimate_number', $id)
            ->first();
    }

    public function create(array $data): Estimate
    {
        return DB::transaction(function () use ($data) {
            // Generate estimate number like EST-YYMMDD-XXX with retry
            $today = now();
            $dateStr = $today->format('ymd');
            $prefix = 'EST-' . $dateStr . '-';

            $maxRetries = 10;
            for ($attempt = 0; $attempt < $maxRetries; $attempt++) {
                $lastEstimate = Estimate::where('estimate_number', 'like', $prefix . '%')
                    ->orderBy('estimate_number', 'desc')
                    ->lockForUpdate()
                    ->first();

                $nextSequence = 1;
                if ($lastEstimate && preg_match('/-(\d+)$/', $lastEstimate->estimate_number, $matches)) {
                    $nextSequence = ((int) $matches[1]) + 1;
                }

                $estimateNumber = $prefix . str_pad($nextSequence, 3, '0', STR_PAD_LEFT);

                $userId = auth()->user()?->id;

                try {
                    $estimate = Estimate::create([
                        'id' => (string) Str::uuid(),
                        'customer_id' => $data['customer_id'],
                        'vehicle_id' => $data['vehicle_id'],
                        'status' => $data['status'] ?? 'DRAFT',
                        'total_amount' => $data['total_amount'] ?? 0.00,
                        'mileage' => $data['mileage'] ?? null,
                        'estimate_number' => $estimateNumber,
                        'downpayment_amount' => $data['downpayment_amount'] ?? 0.00,
                        'payment_method' => $data['payment_method'] ?? null,
                        'payment_reference' => $data['payment_reference'] ?? null,
                        'created_by' => $userId,
                        'notes' => $data['notes'] ?? null,
                    ]);

                    if (isset($data['items']) && is_array($data['items'])) {
                        foreach ($data['items'] as $item) {
                            EstimateItem::create([
                                'id' => (string) Str::uuid(),
                                'estimate_id' => $estimate->id,
                                'item_type' => $item['item_type'],
                                'product_id' => $item['product_id'] ?? null,
                                'service_id' => $item['service_id'] ?? null,
                                'quantity' => $item['quantity'] ?? 1,
                                'unit_price' => $item['unit_price'] ?? 0.00,
                                'subtotal' => $item['subtotal'] ?? 0.00,
                                'needs_ordering' => $item['needs_ordering'] ?? false,
                                'custom_name' => $item['custom_name'] ?? null,
                                'is_tentative' => $item['is_tentative'] ?? false,
                            ]);
                        }
                    }

                    return $estimate->load(['customer', 'vehicle', 'items', 'creator.employee', 'editor.employee', 'approver.employee']);
                } catch (\Illuminate\Database\QueryException $e) {
                    if ($e->errorInfo[1] == 23505) { // Unique constraint violation
                        continue; // Retry with next sequence
                    }
                    throw $e;
                }
            }

            throw new \RuntimeException('Failed to generate unique estimate number after ' . $maxRetries . ' attempts.');
        });
    }

    public function update(string $id, array $data): Estimate
    {
        return DB::transaction(function () use ($id, $data) {
            $estimate = Estimate::findOrFail($id);

            $userId = auth()->user()?->id;

            $updateData = [
                'customer_id' => $data['customer_id'] ?? $estimate->customer_id,
                'vehicle_id' => $data['vehicle_id'] ?? $estimate->vehicle_id,
                'status' => $data['status'] ?? $estimate->status,
                'total_amount' => $data['total_amount'] ?? $estimate->total_amount,
                'mileage' => $data['mileage'] ?? $estimate->mileage,
                'downpayment_amount' => $data['downpayment_amount'] ?? $estimate->downpayment_amount,
                'payment_method' => $data['payment_method'] ?? $estimate->payment_method,
                'payment_reference' => $data['payment_reference'] ?? $estimate->payment_reference,
                'notes' => $data['notes'] ?? $estimate->notes,
            ];

            // If it's a general edit (items update, mileage change, total_amount change, downpayment update, or notes update), track edited_by
            if (isset($data['items']) || isset($data['mileage']) || isset($data['total_amount']) || isset($data['downpayment_amount']) || isset($data['notes'])) {
                $updateData['edited_by'] = $userId;
            }

            // If the status is being set to APPROVED or APPROVED WITH DOWNPAYMENT, track approved_by
            if (isset($data['status']) && (strtoupper($data['status']) === 'APPROVED' || strtoupper($data['status']) === 'APPROVED WITH DOWNPAYMENT' || strtoupper($data['status']) === 'APPROVED_WITH_DOWNPAYMENT')) {
                $updateData['approved_by'] = auth()->user()?->id;
            }

            $estimate->update($updateData);

            if (isset($data['items']) && is_array($data['items'])) {
                // Remove old items
                $estimate->items()->delete();

                // Add new items
                foreach ($data['items'] as $item) {
                    EstimateItem::create([
                        'id' => (string) Str::uuid(),
                        'estimate_id' => $estimate->id,
                        'item_type' => $item['item_type'],
                        'product_id' => $item['product_id'] ?? null,
                        'service_id' => $item['service_id'] ?? null,
                        'quantity' => $item['quantity'] ?? 1,
                        'unit_price' => $item['unit_price'] ?? 0.00,
                        'subtotal' => $item['subtotal'] ?? 0.00,
                        'needs_ordering' => $item['needs_ordering'] ?? false,
                        'custom_name' => $item['custom_name'] ?? null,
                        'is_tentative' => $item['is_tentative'] ?? false,
                    ]);
                }

                // Auto-sync newly-confirmed items to linked SO
                $this->syncConfirmedItemsToSO($estimate);
            }

            return $estimate->load(['customer', 'vehicle', 'items', 'creator.employee', 'editor.employee', 'approver.employee']);
        });
    }

    public function delete(string $id): bool
    {
        $estimate = Estimate::findOrFail($id);
        return $estimate->delete();
    }

    /**
     * Sync confirmed items from estimate to linked SO and JO.
     * Creates SO/JO if they don't exist yet (e.g. all items were tentative at approval).
     * Adds new parts/supplies to SO and new services to JO.
     * Removes items now tentative on estimate (if not yet issued).
     */
    private function syncConfirmedItemsToSO(Estimate $estimate): void
    {
        // Reload items to get fresh data after delete+recreate in update()
        $estimate->load('items');

        // Only sync if estimate is APPROVED
        $upperStatus = strtoupper($estimate->status ?? '');
        if (!in_array($upperStatus, ['APPROVED', 'APPROVED WITH DOWNPAYMENT', 'APPROVED_WITH_DOWNPAYMENT'])) {
            return;
        }

        $salesOrder = \App\Domains\SalesOrder\Domain\Models\SalesOrder::where('estimate_id', $estimate->id)->first();

        // ── If no SO exists, create one if there are confirmed parts/supplies ──
        if (!$salesOrder) {
            $confirmedParts = $estimate->items->where('is_tentative', false)
                ->whereIn('item_type', ['part', 'supply']);

            if ($confirmedParts->isNotEmpty()) {
                $salesOrder = $this->createSalesOrderForEstimate($estimate, $confirmedParts);
            }
        }

        // ── If still no SO, check JO-only case (services only) ──
        if (!$salesOrder) {
            $jobOrder = \App\Domains\JobOrder\Domain\Models\JobOrder::where('estimate_id', $estimate->id)->first();

            if (!$jobOrder) {
                $confirmedServices = $estimate->items->where('item_type', 'service')
                    ->where('is_tentative', false);

                if ($confirmedServices->isNotEmpty()) {
                    $jobOrder = $this->createStandaloneJobOrder($estimate, $confirmedServices);
                }
            }

            if ($jobOrder) {
                $this->syncServicesToJobOrder($jobOrder, $estimate);
            }
            return;
        }

        // SO exists but not in editable state
        if (!in_array($salesOrder->Status, ['APPROVED', 'IN_PROGRESS'])) {
            return;
        }

        // ── Sync parts/supplies to SO ──
        $existingProductIds = $salesOrder->items->pluck('ProductID')->filter()->toArray();
        $existingCustomNames = $salesOrder->items->pluck('custom_name')->filter()->toArray();
        $newItems = [];
        $soRecalculated = false;

        foreach ($estimate->items as $estItem) {
            if (!empty($estItem->is_tentative)) continue;
            if (!in_array($estItem->item_type, ['part', 'supply'], true)) continue;

            $quantity = (int) ($estItem->quantity ?? 1);
            $unitPrice = round((float) ($estItem->unit_price ?? 0), 2);
            $subTotal = round($quantity * $unitPrice, 2);

            // Check if already on SO
            $existingSOItem = $salesOrder->items->first(function ($soItem) use ($estItem) {
                if (!empty($estItem->product_id) && $soItem->ProductID === $estItem->product_id) return true;
                if (!empty($estItem->custom_name) && $soItem->custom_name === $estItem->custom_name) return true;
                return false;
            });

            if ($existingSOItem) {
                // Update existing SO item if price, quantity, or needs_ordering changed
                if ((float) $existingSOItem->UnitPrice !== $unitPrice
                    || (int) $existingSOItem->quantity !== $quantity
                    || $existingSOItem->needs_ordering !== (bool) ($estItem->needs_ordering ?? false)) {

                    $existingSOItem->update([
                        'UnitPrice' => $unitPrice,
                        'SubTotal' => $subTotal,
                        'quantity' => $quantity,
                        'needs_ordering' => $estItem->needs_ordering ?? false,
                    ]);
                    $soRecalculated = true;
                }
                continue;
            }

            // Add new item to SO
            $taxAtSale = 'NON_VAT';
            if (!empty($estItem->product_id)) {
                $ps = \App\Domains\Supplier\Domain\Models\ProductSupplier::where('product_id', $estItem->product_id)->first();
                $taxAtSale = $ps && $ps->is_vat ? 'VAT' : 'NON_VAT';
            }

            $newItem = \App\Domains\SalesOrder\Domain\Models\SalesOrderItem::create([
                'SalesOrderID' => $salesOrder->id,
                'ProductID' => $estItem->product_id,
                'custom_name' => $estItem->custom_name,
                'quantity' => $quantity,
                'UnitPrice' => $unitPrice,
                'SubTotal' => $subTotal,
                'CostAtSale' => 0.00,
                'TaxAtSale' => $taxAtSale,
                'needs_ordering' => $estItem->needs_ordering ?? false,
            ]);

            $newItems[] = $newItem;
            if (!empty($estItem->product_id)) {
                $existingProductIds[] = $estItem->product_id;
            }
            if (!empty($estItem->custom_name)) {
                $existingCustomNames[] = $estItem->custom_name;
            }
        }

        // Sync needs_ordering flag for items on SO
        foreach ($salesOrder->items as $soItem) {
            $estItem = $estimate->items->first(function ($ei) use ($soItem) {
                if (!empty($soItem->ProductID) && $ei->product_id === $soItem->ProductID) return true;
                if (!empty($soItem->custom_name) && !empty($ei->custom_name) && $ei->custom_name === $soItem->custom_name) return true;
                return false;
            });
            if ($estItem) {
                if ($soItem->needs_ordering !== (bool) ($estItem->needs_ordering ?? false)) {
                    $soItem->update(['needs_ordering' => $estItem->needs_ordering ?? false]);
                }
            }
        }

        // Auto-reserve newly added items and recalculate SO Total
        if (!empty($newItems)) {
            $reserveService = app(\App\Domains\SalesOrder\Application\Services\ReserveInventoryService::class);
            $reserveService->reserveItems($newItems);

            $totalAmount = $salesOrder->items()->sum('SubTotal');
            $salesOrder->update([
                'Total' => $totalAmount,
            ]);
        }

        // ── Sync services to JO ──
        $jobOrder = $salesOrder->jobOrder;
        if (!$jobOrder) {
            // Also check by estimate_id (JO-only case from initial approval)
            $jobOrder = \App\Domains\JobOrder\Domain\Models\JobOrder::where('estimate_id', $estimate->id)->first();
        }

        if (!$jobOrder) {
            // No JO exists — create one if there are confirmed services
            $confirmedServices = $estimate->items->where('item_type', 'service')
                ->where('is_tentative', false);

            if ($confirmedServices->isNotEmpty()) {
                $jobOrder = $this->createJobOrderForSO($salesOrder, $estimate);
            }
        }

        // Link SO ↔ JO if both exist but aren't connected
        if ($salesOrder && $jobOrder) {
            if (empty($jobOrder->SaleOrderID)) {
                $jobOrder->update(['SaleOrderID' => $salesOrder->id]);
            }
            if (empty($salesOrder->job_order_id)) {
                $salesOrder->update(['job_order_id' => $jobOrder->id]);
            }
        }

        if ($jobOrder) {
            $this->syncServicesToJobOrder($jobOrder, $estimate);
        }
    }

    /**
     * Create a Sales Order for an estimate that didn't have one (e.g. all items were tentative at approval).
     */
    private function createSalesOrderForEstimate(Estimate $estimate, $confirmedParts): \App\Domains\SalesOrder\Domain\Models\SalesOrder
    {
        $authUserId = auth()->user()?->id;
        $employeeId = $authUserId ? (auth()->user() ? auth()->user()->employeeID : null) : null;
        if (!$employeeId) {
            $firstEmployee = DB::table('Main.Employees')->first();
            $employeeId = $firstEmployee?->id;
        }

        $totalParts = 0;
        $partSupplyItems = [];
        foreach ($confirmedParts as $estItem) {
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
        }

        do {
            $soNumber = 'SO-' . now()->format('ymd') . '-' . random_int(1000, 9999);
        } while (\App\Domains\SalesOrder\Domain\Models\SalesOrder::withTrashed()->where('so_number', $soNumber)->exists());

        $salesOrder = \App\Domains\SalesOrder\Domain\Models\SalesOrder::create([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'so_number' => $soNumber,
            'estimate_id' => $estimate->id,
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

            \App\Domains\SalesOrder\Domain\Models\SalesOrderItem::create([
                'id' => (string) \Illuminate\Support\Str::uuid(),
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

        return $salesOrder;
    }

    /**
     * Create a standalone Job Order (no linked SO) for services-only estimates.
     */
    private function createStandaloneJobOrder(Estimate $estimate, $confirmedServices): \App\Domains\JobOrder\Domain\Models\JobOrder
    {
        $pendingStatusId = DB::connection('pgsql')
            ->table('Main.Status')
            ->where('name', 'Pending')
            ->where('category', 'JOB_ORDER')
            ->value('id');

        $joNumber = \App\Domains\JobOrder\Domain\Models\JobOrder::generateJoNumber();

        $jobOrder = \App\Domains\JobOrder\Domain\Models\JobOrder::create([
            'jo_number' => $joNumber,
            'SaleOrderID' => null,
            'estimate_id' => $estimate->id,
            'VehicleID' => '',
            'TechnicianID' => null,
            'date' => now(),
            'status' => $pendingStatusId,
            'vehicle_id_new' => $estimate->vehicle_id,
        ]);

        foreach ($confirmedServices as $estItem) {
            \App\Domains\JobOrder\Domain\Models\JobOrderService::create([
                'JobOrderID' => $jobOrder->id,
                'ServiceID' => $estItem->service_id,
                'custom_name' => $estItem->custom_name,
                'PriceAtSale' => (float) ($estItem->unit_price ?? 0),
            ]);
        }

        return $jobOrder;
    }

    /**
     * Sync confirmed services to a Job Order (add new ones).
     */
    private function syncServicesToJobOrder(\App\Domains\JobOrder\Domain\Models\JobOrder $jobOrder, Estimate $estimate): void
    {
        $existingServiceIds = $jobOrder->services->pluck('ServiceID')->filter()->toArray();
        $existingServiceNames = $jobOrder->services->pluck('custom_name')->filter()->toArray();

        foreach ($estimate->items as $estItem) {
            if (!empty($estItem->is_tentative)) continue;
            if ($estItem->item_type !== 'service') continue;

            // Skip if already on JO
            if (!empty($estItem->service_id) && in_array($estItem->service_id, $existingServiceIds)) continue;
            if (!empty($estItem->custom_name) && in_array($estItem->custom_name, $existingServiceNames)) continue;

            \App\Domains\JobOrder\Domain\Models\JobOrderService::create([
                'JobOrderID' => $jobOrder->id,
                'ServiceID' => $estItem->service_id,
                'custom_name' => $estItem->custom_name,
                'PriceAtSale' => (float) ($estItem->unit_price ?? 0),
            ]);
            if (!empty($estItem->service_id)) {
                $existingServiceIds[] = $estItem->service_id;
            }
            if (!empty($estItem->custom_name)) {
                $existingServiceNames[] = $estItem->custom_name;
            }
        }
    }

    /**
     * Create a Job Order for a Sales Order that doesn't have one yet.
     */
    private function createJobOrderForSO(\App\Domains\SalesOrder\Domain\Models\SalesOrder $salesOrder, Estimate $estimate): \App\Domains\JobOrder\Domain\Models\JobOrder
    {
        $pendingStatusId = DB::connection('pgsql')
            ->table('Main.Status')
            ->where('name', 'Pending')
            ->where('category', 'JOB_ORDER')
            ->value('id');

        $joNumber = \App\Domains\JobOrder\Domain\Models\JobOrder::generateJoNumber();

        $jobOrder = \App\Domains\JobOrder\Domain\Models\JobOrder::create([
            'jo_number' => $joNumber,
            'SaleOrderID' => $salesOrder->id,
            'estimate_id' => $estimate->id,
            'VehicleID' => '',
            'TechnicianID' => null,
            'date' => now(),
            'status' => $pendingStatusId,
            'vehicle_id_new' => $estimate->vehicle_id,
        ]);

        $salesOrder->update(['job_order_id' => $jobOrder->id]);

        return $jobOrder;
    }
}
