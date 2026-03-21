<?php

namespace App\Domains\Vehicle\Application\UseCases;

use App\Domains\Vehicle\Domain\Repositories\VehicleVariantRepositoryInterface;
use App\Domains\Vehicle\Domain\Models\VehicleVariant;

class CreateVehicleVariant
{
    public function __construct(private VehicleVariantRepositoryInterface $repository) {}

    public function execute(array $data): VehicleVariant
    {
        // Convert engine from "2.8L" format to integer (2800)
        if (isset($data['engine'])) {
            $engineStr = $data['engine'];
            if (preg_match('/(\d+(?:\.\d+)?)L/i', $engineStr, $matches)) {
                $data['engine_displacement'] = (int) ($matches[1] * 1000);
            }
            unset($data['engine']);
        }

        // Handle year range
        if (isset($data['year'])) {
            $yearStr = $data['year'];
            if (strpos($yearStr, '-') !== false) {
                [$start, $end] = explode('-', $yearStr, 2);
                $data['year_start'] = (int) trim($start);
                $data['year_end'] = (int) trim($end);
            } else {
                $data['year_start'] = (int) $yearStr;
                $data['year_end'] = (int) $yearStr;
            }
            unset($data['year']);
        }

        // Map frontend fields to database fields
        $mappedData = [
            'car_model_id' => $data['car_model_id'],
            'variant_name' => $data['name'] ?? $data['variant'],
            'engine_displacement' => $data['engine_displacement'] ?? null,
            'year_start' => $data['year_start'] ?? null,
            'year_end' => $data['year_end'] ?? null,
            'transmission_type' => $data['transmission'] ?? null,
            'oil_capacity' => $data['oilCapacity'] ?? $data['oil_capacity'] ?? null,
            'service_class' => $data['serviceClass'] ?? $data['service_class'] ?? null,
        ];

        return $this->repository->create($mappedData);
    }
}
