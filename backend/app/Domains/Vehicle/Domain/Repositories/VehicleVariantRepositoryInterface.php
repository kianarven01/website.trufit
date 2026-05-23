<?php

namespace App\Domains\Vehicle\Domain\Repositories;

use App\Domains\Vehicle\Domain\Models\VehicleVariant;
use Illuminate\Database\Eloquent\Collection;

interface VehicleVariantRepositoryInterface
{
    public function getVariantsByCarModelId(int $carModelId): Collection;
    public function findById(int $id): ?VehicleVariant;
    public function create(array $data): VehicleVariant;
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;
}
