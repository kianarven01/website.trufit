<?php

namespace App\Domains\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Inventory\Domain\Models\StockLocation;
use App\Domains\Inventory\Domain\Models\Inventory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WarehouseController extends Controller
{
    public function index(): JsonResponse
    {
        $locations = StockLocation::with('bins')
            ->orderBy('name')
            ->get();

        return response()->json(['data' => $locations]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', 'unique:StockLocations,code'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $location = StockLocation::create([
            'id' => (string) Str::uuid(),
            'name' => $validated['name'],
            'code' => $validated['code'],
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'message' => 'Warehouse created successfully.',
            'data' => $location,
        ], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $location = StockLocation::findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'code' => ['sometimes', 'string', 'max:50', 'unique:StockLocations,code,' . $id . ',id'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $location->update($validated);

        return response()->json([
            'message' => 'Warehouse updated successfully.',
            'data' => $location,
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $location = StockLocation::findOrFail($id);

        $hasInventory = Inventory::where('location_id', $id)->exists();
        if ($hasInventory) {
            return response()->json([
                'message' => 'Cannot delete warehouse with existing inventory records. Move or remove inventory first.',
            ], 422);
        }

        $hasBins = $location->bins()->count() > 0;
        if ($hasBins) {
            return response()->json([
                'message' => 'Cannot delete warehouse with existing bin locations. Delete or move bins first.',
            ], 422);
        }

        $location->delete();

        return response()->json([
            'message' => 'Warehouse deleted successfully.',
        ]);
    }
}
