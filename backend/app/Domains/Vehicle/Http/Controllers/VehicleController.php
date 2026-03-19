<?php

namespace App\Domains\Vehicle\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Product\Domain\Models\Manufacturers;
use App\Domains\Vehicle\Domain\Models\VehicleModel;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    /**
     * GET /api/vehicles
     * Returns all vehicles with their brand (make) eager-loaded.
     */
    public function index()
    {
        $vehicles = VehicleModel::with('manufacturer')->orderBy('id')->get();

        return response()->json([
            'data' => $vehicles->map(fn($v) => $this->format($v)),
        ]);
    }

    /**
     * GET /api/vehicles/manufacturers
     * Returns all distinct makes (manufacturers) for the filter dropdown.
     */
    public function manufacturers()
    {
        $manufacturers = Manufacturers::select('id', 'name')->orderBy('name')->get();

        return response()->json(['data' => $manufacturers]);
    }

    /**
     * POST /api/vehicles
     * Creates a new vehicle. Auto-creates the brand if it doesn't exist.
     */
    public function store(Request $request)
    {
        $request->validate([
            'make'      => 'required|string|max:100',
            'model'     => 'required|string|max:100',
            'image_url' => 'nullable|string',
        ]);

        $manufacturer = Manufacturers::firstOrCreate(
            ['name' => ucfirst(strtolower(trim($request->make)))],
        );

        $vehicle = VehicleModel::create([
            'manufacturer_id' => $manufacturer->id,
            'model'           => trim($request->model),
            'image_path'      => $request->image_url ?? null,
        ]);

        $vehicle->load('manufacturer');

        return response()->json([
            'data' => $this->format($vehicle),
        ], 201);
    }

    /**
     * PUT /api/vehicles/{id}
     * Updates an existing vehicle.
     */
    public function update(Request $request, int $id)
    {
        $vehicle = VehicleModel::findOrFail($id);

        $request->validate([
            'make'      => 'required|string|max:100',
            'model'     => 'required|string|max:100',
            'image_url' => 'nullable|string',
        ]);

        $manufacturer = Manufacturers::firstOrCreate(
            ['name' => ucfirst(strtolower(trim($request->make)))],
        );

        $vehicle->update([
            'manufacturer_id' => $manufacturer->id,
            'model'           => trim($request->model),
            'image_path'      => $request->image_url ?? $vehicle->image_path,
        ]);

        $vehicle->load('manufacturer');

        return response()->json([
            'data' => $this->format($vehicle),
        ]);
    }

    /**
     * DELETE /api/vehicles/{id}
     */
    public function destroy(int $id)
    {
        $vehicle = VehicleModel::findOrFail($id);
        $vehicle->delete();

        return response()->json(['message' => 'Vehicle deleted.']);
    }

    /**
     * Normalise the model into the shape the frontend expects.
     */
    private function format(VehicleModel $v): array
    {
        return [
            'id'              => $v->id,
            'make'            => $v->manufacturer?->name ?? '',
            'manufacturer_id' => $v->manufacturer_id,
            'model'           => $v->model,
            'image_url'       => $v->image_path,
        ];
    }
}
