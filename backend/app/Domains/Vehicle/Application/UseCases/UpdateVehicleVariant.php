<?php

namespace App\Domains\Vehicle\Application\UseCases;

use App\Domains\Vehicle\Domain\Repositories\VehicleVariantRepositoryInterface;
use App\Domains\Vehicle\Domain\Models\VehicleVariant;

class UpdateVehicleVariant
{
    public function __construct(private VehicleVariantRepositoryInterface $repository) {}

    public function execute(int $id, array $data): ?VehicleVariant
    {
        $mappedData = [];

        if (array_key_exists('variant_name', $data) || array_key_exists('name', $data) || array_key_exists('variant', $data)) {
            $mappedData['variant_name'] = $data['variant_name'] ?? $data['name'] ?? $data['variant'];
        }

        if (array_key_exists('engine_displacement', $data)) {
            $mappedData['engine_displacement'] = $data['engine_displacement'];
        }

        if (array_key_exists('year', $data)) {
            $mappedData['year'] = $data['year'] !== null && $data['year'] !== '' ? (int) $data['year'] : null;
        }

        if (array_key_exists('transmission_type', $data) || array_key_exists('transmission', $data)) {
            $mappedData['transmission_type'] = $data['transmission_type'] ?? $data['transmission'];
        }

        if (array_key_exists('drivetrain', $data)) {
            $mappedData['drivetrain'] = $data['drivetrain'];
        }

        if (array_key_exists('oil_capacity', $data) || array_key_exists('oilCapacity', $data)) {
            $mappedData['oil_capacity'] = $data['oil_capacity'] ?? $data['oilCapacity'];
        }

        if (array_key_exists('service_class', $data) || array_key_exists('serviceClass', $data)) {
            $mappedData['service_class'] = $data['service_class'] ?? $data['serviceClass'];
        }

        $success = $this->repository->update($id, $mappedData);

        return $success ? $this->repository->findById($id) : null;
    }
}