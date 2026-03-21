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
                    'year' => $variant->year_start . ($variant->year_end && $variant->year_end !== $variant->year_start ? '-' . $variant->year_end : ''),
                    'engine' => $variant->engine_displacement ? ($variant->engine_displacement / 1000) . 'L' : '',
                    'transmission' => $variant->transmission_type ?? '',
                    'oilCapacity' => $variant->oil_capacity,
                    'serviceClass' => $variant->service_class,
                ];
            })
            ->toArray();
    }
}
