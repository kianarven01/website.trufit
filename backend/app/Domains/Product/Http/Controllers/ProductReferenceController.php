<?php

namespace App\Domains\Product\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Product\Domain\Models\Category;
use App\Domains\Product\Domain\Models\Unit;
use App\Domains\Product\Domain\Models\VehicleModel;
use Illuminate\Support\Facades\DB;

class ProductReferenceController extends Controller
{
    public function categories()
    {
        $categories = Category::select('id', 'name', 'code')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $categories
        ]);
    }

    public function units()
    {
        $units = Unit::select('id', 'name')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $units
        ]);
    }

    public function vehicles()
    {
        $models = VehicleModel::with(['manufacturer', 'variants'])->get();
        return response()->json([
            'data' => $models
        ]);
    }

    public function manufacturers()
    {
        $manufacturers = \App\Domains\Product\Domain\Models\Manufacturer::where('type', 'Vehicle')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $manufacturers
        ]);
    }

    public function storeCustomVehicle(\Illuminate\Http\Request $request)
    {
        $request->validate([
            'make' => 'required|string',
            'model' => 'required|string',
            'variant' => 'nullable|string',
            'year' => 'nullable|numeric'
        ]);

        // Find or create Manufacturer
        $manufacturer = \App\Domains\Product\Domain\Models\Manufacturer::firstOrCreate(
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
        $services = \App\Domains\Product\Domain\Models\ServiceType::all();
        return response()->json([
            'data' => $services
        ]);
    }

    public function showServiceType($id)
    {
        $service = \App\Domains\Product\Domain\Models\ServiceType::with('pricings')->find($id);
        if (!$service) {
            return response()->json(['message' => 'Service not found'], 404);
        }
        return response()->json(['data' => $service]);
    }

    public function storeServiceType(\Illuminate\Http\Request $request)
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

        $service = \App\Domains\Product\Domain\Models\ServiceType::create([
            'name' => ucfirst($data['name']),
            'category' => ucfirst($data['category_name']),
            'description' => $data['description'] ?? '',
            'duration' => $data['duration'] ?? 0,
            'pricing_type' => $data['pricing_type'] ?? 'fixed',
            'price' => $data['price'] ?? 0
        ]);

        if (isset($data['pricing']) && is_array($data['pricing'])) {
            foreach ($data['pricing'] as $p) {
                \App\Domains\Product\Domain\Models\ServicePricing::create([
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

    public function updateServiceType(\Illuminate\Http\Request $request, $id)
    {
        $service = \App\Domains\Product\Domain\Models\ServiceType::find($id);
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
                \App\Domains\Product\Domain\Models\ServicePricing::create([
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
        $service = \App\Domains\Product\Domain\Models\ServiceType::find($id);
        if (!$service) {
            return response()->json(['message' => 'Service not found'], 404);
        }
        $service->delete();
        return response()->json(['message' => 'Service deleted successfully']);
    }
}