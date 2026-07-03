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
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

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

        $imagePath = $this->uploadVehicleImage($request);

        $vehicleData = new VehicleData(
            $manufacturer->id,
            trim($request->input('model')),
            $imagePath
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

        $variantIds = $vehicle->variants()->pluck('id');
        $hasVariants = $vehicle->variants()->exists();
        $hasParts = \App\Domains\Product\Domain\Models\ProductVehicleCompatibility::whereIn('car_variant_id', $variantIds)->exists();
        $hasCustomerVehicles = \App\Domains\Customer\Domain\Models\CustomerVehicle::whereIn('vehicle_variant_id', $variantIds)->exists();

        if ($hasVariants || $hasParts || $hasCustomerVehicles) {
            return response()->json([
                'message' => 'This vehicle cannot be updated because it has variants, parts compatibility, or customer vehicles associated with it.',
            ], 422);
        }

        $manufacturer = Manufacturers::query()
            ->where('id', $request->input('manufacturer_id'))
            ->where('type', 'Vehicle')
            ->firstOrFail();

        $imagePath = $vehicle->image_path;

        if ($request->hasFile('image')) {
            $imagePath = $this->uploadVehicleImage($request);
        }

        $vehicleData = new VehicleData(
            $manufacturer->id,
            trim($request->input('model')),
            $imagePath
        );

        $vehicle = $this->updateUseCase->execute($vehicle, $vehicleData);
        $vehicle->load('manufacturer');

        return response()->json([
            'data' => $this->formatter->format($vehicle),
        ]);
    }

    private function uploadVehicleImage($request): ?string
    {
        if (! $request->hasFile('image')) {
            return null;
        }

        $file = $request->file('image');

        $bucket = 'vehicle_images';
        $baseUrl = rtrim(env('SUPABASE_URL'), '/');
        $serviceKey = env('SUPABASE_SERVICE_ROLE_KEY');

        $extension = $file->getClientOriginalExtension();
        $fileName = 'vehicles/' . Str::uuid() . '.' . $extension;

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $serviceKey,
            'apikey' => $serviceKey,
            'Content-Type' => $file->getMimeType(),
            'x-upsert' => 'false',
        ])->withBody(
            file_get_contents($file->getRealPath()),
            $file->getMimeType()
        )->post("{$baseUrl}/storage/v1/object/{$bucket}/{$fileName}");

        if (! $response->successful()) {
            abort(500, 'Failed to upload vehicle image: ' . $response->body());
        }

        return $fileName;
    }

    public function destroy(int $id): JsonResponse
    {
        $vehicle = $this->repository->findOrFail($id);

        $variantIds = $vehicle->variants()->pluck('id');
        $hasVariants = $vehicle->variants()->exists();
        $hasParts = \App\Domains\Product\Domain\Models\ProductVehicleCompatibility::whereIn('car_variant_id', $variantIds)->exists();
        $hasCustomerVehicles = \App\Domains\Customer\Domain\Models\CustomerVehicle::whereIn('vehicle_variant_id', $variantIds)->exists();

        if ($hasVariants || $hasParts || $hasCustomerVehicles) {
            return response()->json([
                'message' => 'This vehicle cannot be deleted because it has variants, parts compatibility, or customer vehicles associated with it.',
            ], 422);
        }

        $manufacturerId = $vehicle->manufacturer_id;

        $this->repository->delete($vehicle);

        // Delete the manufacturer if no other models exist under it
        $hasOtherModels = \App\Domains\Vehicle\Domain\Models\VehicleModel::where('manufacturer_id', $manufacturerId)->exists();
        if (!$hasOtherModels) {
            Manufacturers::where('id', $manufacturerId)->delete();
        }

        return response()->json([
            'message' => 'Vehicle deleted.',
        ]);
    }

    public function getVariants(int $carModelId): JsonResponse
    {
        VehicleModel::query()->findOrFail($carModelId);

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

        if (! $variant) {
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

        if (! $success) {
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
        return [
            'id' => (string) $variant->id,
            'name' => $variant->variant_name,
            'year' => (string) $variant->year,
            'engine' => $variant->engine_displacement ?? '',
            'transmission' => $variant->transmission_type ?? '',
            'drivetrain' => $variant->drivetrain ?? '',
            'fuel' => $variant->fuel_type ?? '',
            'bodyType' => $variant->body_type ?? '',
            'oilCapacity' => $variant->oil_capacity,
            'serviceClass' => $variant->service_class ?? '',
        ];
    }
}