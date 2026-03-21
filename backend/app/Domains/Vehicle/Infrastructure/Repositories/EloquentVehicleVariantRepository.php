<?php

namespace App\Domains\Vehicle\Infrastructure\Repositories;

use App\Domains\Vehicle\Domain\Models\VehicleVariant;
use App\Domains\Vehicle\Domain\Repositories\VehicleVariantRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class EloquentVehicleVariantRepository implements VehicleVariantRepositoryInterface
{
    public function getVariantsByCarModelId(int $carModelId): Collection
    {
        return VehicleVariant::where('car_model_id', $carModelId)
            ->orderBy('variant_name')
            ->get();
    }

    public function findById(int $id): ?VehicleVariant
    {
        return VehicleVariant::find($id);
    }

    public function create(array $data): VehicleVariant
    {
        return VehicleVariant::create($data);
    }

    public function update(int $id, array $data): bool
    {
        $variant = $this->findById($id);

        if (!$variant) {
            return false;
        }

        return $variant->update($data);
    }

    public function delete(int $id): bool
    {
        $variant = $this->findById($id);

        if (!$variant) {
            return false;
        }

        return (bool) $variant->delete();
    }
}