<?php

namespace App\Domains\Vehicle\Application\UseCases;

use App\Domains\Vehicle\Application\DTO\VehicleData;
use App\Domains\Vehicle\Infrastructure\Repositories\VehicleRepository;

class CreateVehicleUseCase
{
    public function __construct(private VehicleRepository $repository)
    {
    }

    public function execute(VehicleData $data)
    {
        return $this->repository->create([
            'manufacturer_id' => $data->manufacturer_id,
            'model' => $data->model,
            'image_path' => $data->image_path,
        ]);
    }
}
