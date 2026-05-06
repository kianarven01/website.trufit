<?php

namespace App\Domains\Product\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Product\Domain\Models\Category;
use App\Domains\Product\Domain\Models\Unit;
use App\Domains\Product\Domain\Models\VehicleModel;

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
}