<?php

namespace App\Domains\Vehicle\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Product\Domain\Models\Manufacturers;
use App\Domains\Vehicle\Domain\Models\VehicleModel;
use App\Domains\Vehicle\Domain\Models\VehicleVariant;
use App\Domains\Vehicle\Application\DTO\VehicleData;
use App\Domains\Vehicle\Application\Services\VehicleFormatter;
use App\Domains\Vehicle\Application\UseCases\CreateVehicleUseCase;
use App\Domains\Vehicle\Application\UseCases\UpdateVehicleUseCase;
use App\Domains\Vehicle\Http\Requests\StoreVehicleRequest;
use App\Domains\Vehicle\Http\Requests\UpdateVehicleRequest;
use App\Domains\Vehicle\Http\Requests\StoreVehicleVariantRequest;
use App\Domains\Vehicle\Http\Requests\UpdateVehicleVariantRequest;
use App\Domains\Vehicle\Infrastructure\Repositories\VehicleRepository;
use App\Domains\Vehicle\Infrastructure\Repositories\EloquentVehicleVariantRepository;
use Illuminate\Http\JsonResponse;

class VehicleController extends Controller
{
    public function __construct(
        private VehicleRepository $repository,
        private CreateVehicleUseCase $createUseCase,
        private UpdateVehicleUseCase $updateUseCase,
        private VehicleFormatter $formatter,
        private EloquentVehicleVariantRepository $variantRepository
    ) {}

    public function index(): JsonResponse
    {
        $vehicles = $this->repository->allWithManufacturer();

        return response()->json([
            'data' => $vehicles->map(
                fn (VehicleModel $v) => $this->formatter->format($v)
            )->values(),
        ]);
    }

    public function manufacturers(): JsonResponse
    {
        $manufacturers = Manufacturers::select('id', 'name')
            ->where('type', 'Vehicle')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $manufacturers,
        ]);
    }

    public function store(StoreVehicleRequest $request): JsonResponse
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

        return response()->json([
            'data' => $this->formatter->format($vehicle),
        ], 201);
    }

    public function update(UpdateVehicleRequest $request, int $id): JsonResponse
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

        return response()->json([
            'data' => $this->formatter->format($vehicle),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $vehicle = $this->repository->findOrFail($id);
        $this->repository->delete($vehicle);

        return response()->json([
            'message' => 'Vehicle deleted.',
        ]);
    }

    public function getVariants(int $carModelId): JsonResponse
    {
        $variants = $this->variantRepository->getVariantsByCarModelId($carModelId);

        return response()->json(
            $variants->map(fn (VehicleVariant $variant) => $this->formatVariant($variant))->values()
        );
    }

    public function storeVariant(int $carModelId, StoreVehicleVariantRequest $request): JsonResponse
    {
        VehicleModel::query()->findOrFail($carModelId);

        $data = $request->validated();
        $data['car_model_id'] = $carModelId;

        $variant = $this->variantRepository->create($data);

        return response()->json(
            $this->formatVariant($variant),
            201
        );
    }

    public function updateVariant(int $variantId, UpdateVehicleVariantRequest $request): JsonResponse
    {
        $variant = $this->variantRepository->findById($variantId);

        if (!$variant) {
            return response()->json([
                'message' => 'Variant not found.',
            ], 404);
        }

        $variant->update($request->validated());
        $variant->refresh();

        return response()->json(
            $this->formatVariant($variant)
        );
    }

    public function destroyVariant(int $variantId): JsonResponse
    {
        $success = $this->variantRepository->delete($variantId);

        if (!$success) {
            return response()->json([
                'message' => 'Variant not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Variant deleted.',
        ]);
    }

    private function formatVariant(VehicleVariant $variant): array
    {
        $year = (string) $variant->year_start;

        if (
            !is_null($variant->year_end) &&
            $variant->year_end !== $variant->year_start
        ) {
            $year .= '-' . $variant->year_end;
        }

        $engine = '';
        if (!is_null($variant->engine_displacement) && $variant->engine_displacement > 0) {
            $engine = rtrim(rtrim(number_format($variant->engine_displacement / 1000, 1, '.', ''), '0'), '.') . 'L';
        }

        return [
            'id' => (string) $variant->id,
            'name' => $variant->variant_name,
            'year' => $year,
            'engine' => $engine,
            'transmission' => $variant->transmission_type ?? '',
            'oilCapacity' => $variant->oil_capacity,
            'serviceClass' => $variant->service_class ?? '',
        ];
    }
}