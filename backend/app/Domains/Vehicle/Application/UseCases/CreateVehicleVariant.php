<?php

namespace App\Domains\Vehicle\Application\UseCases;

use App\Domains\Vehicle\Domain\Repositories\VehicleVariantRepositoryInterface;
use App\Domains\Vehicle\Domain\Models\VehicleVariant;

class CreateVehicleVariant
{
    public function __construct(private VehicleVariantRepositoryInterface $repository) {}

    public function execute(array $data): VehicleVariant
    {
        $mappedData = [
            'car_model_id' => (int) $data['car_model_id'],
            'variant_name' => $data['variant_name'] ?? $data['name'] ?? $data['variant'] ?? null,
            'engine_displacement' => $data['engine_displacement'] ?? null,
            'year' => isset($data['year']) && $data['year'] !== '' ? (int) $data['year'] : null,
            'transmission_type' => $data['transmission_type'] ?? $data['transmission'] ?? null,
            'drivetrain' => $data['drivetrain'] ?? null,
            'oil_capacity' => $data['oil_capacity'] ?? $data['oilCapacity'] ?? null,
            'service_class' => $data['service_class'] ?? $data['serviceClass'] ?? null,
        ];

        return $this->repository->create($mappedData);
    }
}