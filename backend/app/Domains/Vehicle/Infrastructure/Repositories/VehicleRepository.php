<?php

namespace App\Domains\Vehicle\Infrastructure\Repositories;

use App\Domains\Vehicle\Domain\Models\VehicleModel;

class VehicleRepository
{
    public function allWithManufacturer()
    {
        return VehicleModel::with('manufacturer')->withCount('variants')->orderBy('id')->get();
    }

    public function findOrFail(int $id): VehicleModel
    {
        return VehicleModel::findOrFail($id);
    }

    public function create(array $data): VehicleModel
    {
        return VehicleModel::create($data);
    }

    public function update(VehicleModel $vehicle, array $data): VehicleModel
    {
        $vehicle->update($data);
        return $vehicle;
    }

    public function delete(VehicleModel $vehicle): void
    {
        $vehicle->delete();
    }
}
