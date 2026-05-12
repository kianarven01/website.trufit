<?php

namespace App\Domains\Vehicle\Application\UseCases;

use App\Domains\Vehicle\Domain\Repositories\VehicleVariantRepositoryInterface;

class GetVehicleVariants
{
    public function __construct(private VehicleVariantRepositoryInterface $repository) {}

    public function execute(int $carModelId): array
    {
        return $this->repository->getVariantsByCarModelId($carModelId)
            ->map(function ($variant) {
                return [
                    'id' => (string) $variant->id,
                    'name' => $variant->variant_name,
                    'year' => $variant->year ? (string) $variant->year : '',
                    'engine' => $variant->engine_displacement ?? '',
                    'transmission' => $variant->transmission_type ?? '',
                    'drivetrain' => $variant->drivetrain ?? '',
                    'oilCapacity' => $variant->oil_capacity,
                    'serviceClass' => $variant->service_class,
                ];
            })
            ->toArray();
    }
}