<?php

namespace App\Domains\Vehicle\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Product\Domain\Models\Manufacturers;
use App\Domains\Vehicle\Application\DTO\VehicleData;
use App\Domains\Vehicle\Application\Services\VehicleFormatter;
use App\Domains\Vehicle\Application\UseCases\CreateVehicleUseCase;
use App\Domains\Vehicle\Application\UseCases\UpdateVehicleUseCase;
use App\Domains\Vehicle\Infrastructure\Repositories\VehicleRepository;
use App\Domains\Vehicle\Http\Requests\StoreVehicleRequest;
use App\Domains\Vehicle\Http\Requests\UpdateVehicleRequest;
use App\Domains\Vehicle\Domain\Models\VehicleModel;

class VehicleController extends Controller
{
    public function __construct(
        private VehicleRepository $repository,
        private CreateVehicleUseCase $createUseCase,
        private UpdateVehicleUseCase $updateUseCase,
        private VehicleFormatter $formatter
    ) {}

    public function index()
    {
        $vehicles = $this->repository->allWithManufacturer();

        return response()->json([
            'data' => $vehicles->map(fn (VehicleModel $v) => $this->formatter->format($v)),
        ]);
    }

    public function manufacturers()
    {
        $manufacturers = Manufacturers::select('id', 'name')->orderBy('name')->get();

        return response()->json(['data' => $manufacturers]);
    }

    public function store(StoreVehicleRequest $request)
    {
        $manufacturer = Manufacturers::query()
            ->where('id', $request->input('manufacturer_id'))
            ->where('type', 'Vehicle')
            ->firstOrFail();

        $vehicleData = new VehicleData(
            $manufacturer->id,
            trim($request->input('model')),
            $request->input('image_url')
        );

        $vehicle = $this->createUseCase->execute($vehicleData);
        $vehicle->load('manufacturer');

        return response()->json(['data' => $this->formatter->format($vehicle)], 201);
    }

    public function update(UpdateVehicleRequest $request, int $id)
    {
        $vehicle = $this->repository->findOrFail($id);
        $manufacturer = Manufacturers::query()
            ->where('id', $request->input('manufacturer_id'))
            ->where('type', 'Vehicle')
            ->firstOrFail();

        $vehicleData = new VehicleData(
            $manufacturer->id,
            trim($request->input('model')),
            $request->input('image_url')
        );

        $vehicle = $this->updateUseCase->execute($vehicle, $vehicleData);
        $vehicle->load('manufacturer');

        return response()->json(['data' => $this->formatter->format($vehicle)]);
    }

    public function destroy(int $id)
    {
        $vehicle = $this->repository->findOrFail($id);
        $this->repository->delete($vehicle);

        return response()->json(['message' => 'Vehicle deleted.']);
    }
}
