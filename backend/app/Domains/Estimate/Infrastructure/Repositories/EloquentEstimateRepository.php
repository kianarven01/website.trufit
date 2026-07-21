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
            }

            return $estimate->load(['customer', 'vehicle', 'items', 'creator.employee', 'editor.employee', 'approver.employee']);
        });
    }

    public function delete(string $id): bool
    {
        $estimate = Estimate::findOrFail($id);
        return $estimate->delete();
    }
}
