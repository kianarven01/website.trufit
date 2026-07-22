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
     * Adds new parts/supplies to SO and new services to JO.
     * Removes items now tentative on estimate (if not yet issued).
     */
    private function syncConfirmedItemsToSO(Estimate $estimate): void
    {
        $salesOrder = \App\Domains\SalesOrder\Domain\Models\SalesOrder::where('estimate_id', $estimate->id)->first();
        if (!$salesOrder || !in_array($salesOrder->Status, ['APPROVED', 'IN_PROGRESS'])) {
            return;
        }

        // ── Sync parts/supplies to SO ──
        $existingProductIds = $salesOrder->items->pluck('ProductID')->toArray();
        $newItems = [];

        foreach ($estimate->items as $estItem) {
            if (!empty($estItem->is_tentative)) continue;
            if (!in_array($estItem->item_type, ['part', 'supply'], true) || !$estItem->product_id) continue;
            if (in_array($estItem->product_id, $existingProductIds)) continue;

            $quantity = (int) ($estItem->quantity ?? 1);
            $unitPrice = round((float) ($estItem->unit_price ?? 0), 2);
            $subTotal = round($quantity * $unitPrice, 2);

            $ps = \App\Domains\Supplier\Domain\Models\ProductSupplier::where('product_id', $estItem->product_id)->first();
            $taxAtSale = $ps && $ps->is_vat ? 'VAT' : 'NON_VAT';

            $newItem = \App\Domains\SalesOrder\Domain\Models\SalesOrderItem::create([
                'SalesOrderID' => $salesOrder->id,
                'ProductID' => $estItem->product_id,
                'quantity' => $quantity,
                'UnitPrice' => $unitPrice,
                'SubTotal' => $subTotal,
                'CostAtSale' => 0.00,
                'TaxAtSale' => $taxAtSale,
                'needs_ordering' => $estItem->needs_ordering ?? false,
            ]);

            $newItems[] = $newItem;
            $existingProductIds[] = $estItem->product_id;
        }

        // Sync needs_ordering flag and remove items now tentative on estimate
        foreach ($salesOrder->items as $soItem) {
            $estItem = $estimate->items->where('product_id', $soItem->ProductID)->first();
            if ($estItem) {
                if ($soItem->needs_ordering !== (bool) ($estItem->needs_ordering ?? false)) {
                    $soItem->update(['needs_ordering' => $estItem->needs_ordering ?? false]);
                }
                if (!empty($estItem->is_tentative) && !$soItem->is_issued) {
                    $soItem->delete();
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
                'Balance' => $totalAmount,
            ]);
        }

        // ── Sync services to JO ──
        $jobOrder = $salesOrder->jobOrder;
        if (!$jobOrder) {
            // No JO exists — create one if there are services
            $hasServices = $estimate->items->where('item_type', 'service')
                ->where('is_tentative', false)
                ->whereNotNull('service_id')
                ->isNotEmpty();

            if ($hasServices) {
                $jobOrder = $this->createJobOrderForSO($salesOrder, $estimate);
            }
        }

        if ($jobOrder) {
            $existingServiceIds = $jobOrder->services->pluck('ServiceID')->toArray();

            foreach ($estimate->items as $estItem) {
                if (!empty($estItem->is_tentative)) continue;
                if ($estItem->item_type !== 'service' || !$estItem->service_id) continue;
                if (in_array($estItem->service_id, $existingServiceIds)) continue;

                \App\Domains\JobOrder\Domain\Models\JobOrderService::create([
                    'JobOrderID' => $jobOrder->id,
                    'ServiceID' => $estItem->service_id,
                    'PriceAtSale' => (float) ($estItem->unit_price ?? 0),
                ]);
                $existingServiceIds[] = $estItem->service_id;
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
