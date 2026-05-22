<?php

namespace App\Domains\Estimate\Infrastructure\Repositories;

use App\Domains\Estimate\Domain\Models\Estimate;
use App\Domains\Estimate\Domain\Models\EstimateItem;
use App\Domains\Estimate\Domain\Repositories\EstimateRepositoryInterface;
use App\Domains\Customer\Domain\Models\CustomerVehicle;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EloquentEstimateRepository implements EstimateRepositoryInterface
{
    public function getAll()
    {
        return Estimate::with(['customer', 'vehicle', 'items'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function findById(string $id): ?Estimate
    {
        return Estimate::with(['customer', 'vehicle', 'items'])->find($id);
    }

    public function create(array $data): Estimate
    {
        return DB::transaction(function () use ($data) {
            $vehicle = CustomerVehicle::find($data['vehicle_id']);
            $vehicleOld = $vehicle ? $vehicle->plate_number : '';

            $estimate = Estimate::create([
                'id' => (string) Str::uuid(),
                'customer_id' => $data['customer_id'],
                'vehicle_id' => $data['vehicle_id'],
                'vehicle_id_old' => $vehicleOld,
                'status' => $data['status'] ?? 'DRAFT',
                'total_amount' => $data['total_amount'] ?? 0.00,
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
                    ]);
                }
            }

            return $estimate->load(['customer', 'vehicle', 'items']);
        });
    }

    public function update(string $id, array $data): Estimate
    {
        return DB::transaction(function () use ($id, $data) {
            $estimate = Estimate::findOrFail($id);

            $vehicle = CustomerVehicle::find($data['vehicle_id'] ?? $estimate->vehicle_id);
            $vehicleOld = $vehicle ? $vehicle->plate_number : $estimate->vehicle_id_old;

            $estimate->update([
                'customer_id' => $data['customer_id'] ?? $estimate->customer_id,
                'vehicle_id' => $data['vehicle_id'] ?? $estimate->vehicle_id,
                'vehicle_id_old' => $vehicleOld,
                'status' => $data['status'] ?? $estimate->status,
                'total_amount' => $data['total_amount'] ?? $estimate->total_amount,
            ]);

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
                    ]);
                }
            }

            return $estimate->load(['customer', 'vehicle', 'items']);
        });
    }

    public function delete(string $id): bool
    {
        return DB::transaction(function () use ($id) {
            $estimate = Estimate::findOrFail($id);
            $estimate->items()->delete();
            return $estimate->delete();
        });
    }
}
