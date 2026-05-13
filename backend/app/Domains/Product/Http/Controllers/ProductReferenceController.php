<?php

namespace App\Domains\Product\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Product\Domain\Models\Category;
use App\Domains\Product\Domain\Models\Unit;
use App\Domains\Product\Domain\Models\Manufacturers;
use App\Domains\Product\Domain\Models\Manufacturer;
use App\Domains\Product\Domain\Models\VehicleModel;
use App\Domains\Product\Domain\Models\ServiceType;
use App\Domains\Product\Domain\Models\ServicePricing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductReferenceController extends Controller
{
    public function categories(): JsonResponse
    {
        $categories = Category::query()
            ->select('id', 'name', 'code')
            ->withCount('products')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $categories,
        ]);
    }

    public function storeCategory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50'],
        ]);

        $category = Category::create([
            'name' => $validated['name'],
            'code' => $validated['code'] ?? Str::upper(Str::slug($validated['name'], '_')),
        ]);

        return response()->json([
            'message' => 'Category created successfully.',
            'data' => $category,
        ], 201);
    }

    public function updateCategory(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50'],
        ]);

        $category = Category::query()->where('id', $id)->firstOrFail();

        $category->update([
            'name' => $validated['name'],
            'code' => $validated['code'] ?? $category->code,
        ]);

        return response()->json([
            'message' => 'Category updated successfully.',
            'data' => $category,
        ]);
    }

    public function deleteCategory(string $id): JsonResponse
    {
        $category = Category::query()->where('id', $id)->firstOrFail();

        $category->delete();

        return response()->json([
            'message' => 'Category deleted successfully.',
        ]);
    }

    public function units(): JsonResponse
    {
        $units = Unit::query()
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $units,
        ]);
    }

    public function manufacturers(): JsonResponse
    {
        $manufacturers = Manufacturers::query()
            ->select('id', 'name', 'type')
            ->where('type', 'Part')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $manufacturers,
        ]);
    }

    public function vehicles(): JsonResponse
    {
        $vehicles = Manufacturers::query()
            ->select('id', 'name', 'type')
            ->where('type', 'Vehicle')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $vehicles,
        ]);
    }

    public function storeCustomVehicle(Request $request)
    {
        $request->validate([
            'make' => 'required|string',
            'model' => 'required|string',
            'variant' => 'nullable|string',
            'year' => 'nullable|numeric'
        ]);

        // Find or create Manufacturer
        $manufacturer = Manufacturer::firstOrCreate(
            ['name' => $request->make, 'type' => 'Vehicle']
        );

        // Find or create VehicleModel
        $vehicleModel = VehicleModel::firstOrCreate(
            ['model' => $request->model, 'manufacturer_id' => $manufacturer->id]
        );

        return response()->json([
            'message' => 'Vehicle added successfully',
            'data' => [
                'id' => $vehicleModel->id,
                'year' => $request->year ?: 0,
                'make' => $manufacturer->name,
                'model' => $vehicleModel->model,
                'variant' => $request->variant
            ]
        ]);
    }

    public function serviceTypes()
    {
        $services = ServiceType::all();
        return response()->json([
            'data' => $services,
        ]);
    }

    public function showServiceType($id)
    {
        $service = ServiceType::with('pricings')->find($id);
        if (!$service) {
            return response()->json(['message' => 'Service not found'], 404);
        }
        return response()->json(['data' => $service]);
    }

    public function storeServiceType(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'category_name' => 'required|string',
            'description' => 'nullable|string',
            'duration' => 'nullable|integer',
            'pricing_type' => 'nullable|string',
            'price' => 'nullable|numeric',
            'pricing' => 'nullable|array'
        ]);

        $service = ServiceType::create([
            'name' => ucfirst($data['name']),
            'category' => ucfirst($data['category_name']),
            'description' => $data['description'] ?? '',
            'duration' => $data['duration'] ?? 0,
            'pricing_type' => $data['pricing_type'] ?? 'fixed',
            'price' => $data['price'] ?? 0
        ]);

        if (isset($data['pricing']) && is_array($data['pricing'])) {
            foreach ($data['pricing'] as $p) {
                ServicePricing::create([
                    'service_type_id' => $service->id,
                    'vehicle_size_name' => $p['vehicle_size_name'] ?? ($p['vehicle_size_id'] ?? 'Default'),
                    'vehicle_types' => $p['vehicle_types'] ?? [],
                    'price' => $p['price'] ?? 0
                ]);
            }
        }

        return response()->json([
            'message' => 'Service created successfully',
            'data' => $service->load('pricings')
        ]);
    }

    public function updateServiceType(Request $request, $id)
    {
        $service = ServiceType::find($id);
        if (!$service) {
            return response()->json(['message' => 'Service not found'], 404);
        }

        $data = $request->validate([
            'name' => 'required|string',
            'category_name' => 'required|string',
            'description' => 'nullable|string',
            'duration' => 'nullable|integer',
            'pricing_type' => 'nullable|string',
            'price' => 'nullable|numeric',
            'pricing' => 'nullable|array'
        ]);

        $service->update([
            'name' => ucfirst($data['name']),
            'category' => ucfirst($data['category_name']),
            'description' => $data['description'] ?? $service->description,
            'duration' => $data['duration'] ?? $service->duration,
            'pricing_type' => $data['pricing_type'] ?? $service->pricing_type,
            'price' => $data['price'] ?? $service->price
        ]);

        if (isset($data['pricing']) && is_array($data['pricing'])) {
            $service->pricings()->delete();
            foreach ($data['pricing'] as $p) {
                ServicePricing::create([
                    'service_type_id' => $service->id,
                    'vehicle_size_name' => $p['vehicle_size_name'] ?? ($p['vehicle_size_id'] ?? 'Default'),
                    'vehicle_types' => $p['vehicle_types'] ?? [],
                    'price' => $p['price'] ?? 0
                ]);
            }
        }

        return response()->json([
            'message' => 'Service updated successfully',
            'data' => $service->load('pricings')
        ]);
    }

    public function destroyServiceType($id)
    {
        $service = ServiceType::find($id);
        if (!$service) {
            return response()->json(['message' => 'Service not found'], 404);
        }
        $service->delete();
        return response()->json(['message' => 'Service deleted successfully']);
    }
}