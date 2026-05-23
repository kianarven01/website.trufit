<?php

namespace App\Domains\Vehicle\Application\UseCases;

use App\Domains\Vehicle\Application\DTO\VehicleData;
use App\Domains\Vehicle\Domain\Models\VehicleModel;
use App\Domains\Vehicle\Infrastructure\Repositories\VehicleRepository;

class UpdateVehicleUseCase
{
    public function __construct(private VehicleRepository $repository)
    {
    }

    public function execute(VehicleModel $vehicle, VehicleData $data)
    {
        return $this->repository->update($vehicle, [
            'manufacturer_id' => $data->manufacturer_id,
            'model' => $data->model,
            'image_path' => $data->image_path,
        ]);
    }
}
