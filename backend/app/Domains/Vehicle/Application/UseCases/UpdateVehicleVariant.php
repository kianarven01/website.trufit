<?php

namespace App\Domains\Vehicle\Application\UseCases;

use App\Domains\Vehicle\Domain\Repositories\VehicleVariantRepositoryInterface;
use App\Domains\Vehicle\Domain\Models\VehicleVariant;

class UpdateVehicleVariant
{
    public function __construct(private VehicleVariantRepositoryInterface $repository) {}

    public function execute(int $id, array $data): ?VehicleVariant
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
        $mappedData = [];
        if (isset($data['name'])) {
            $mappedData['variant_name'] = $data['name'];
        }
        if (isset($data['engine_displacement'])) {
            $mappedData['engine_displacement'] = $data['engine_displacement'];
        }
        if (isset($data['year_start'])) {
            $mappedData['year_start'] = $data['year_start'];
        }
        if (isset($data['year_end'])) {
            $mappedData['year_end'] = $data['year_end'];
        }
        if (isset($data['transmission'])) {
            $mappedData['transmission_type'] = $data['transmission'];
        }
        if (isset($data['oilCapacity'])) {
            $mappedData['oil_capacity'] = $data['oilCapacity'];
        }
        if (isset($data['serviceClass'])) {
            $mappedData['service_class'] = $data['serviceClass'];
        }

        $success = $this->repository->update($id, $mappedData);
        return $success ? $this->repository->findById($id) : null;
    }
}
