<?php

namespace App\Domains\Inventory\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Inventory\Domain\Models\BinLocation;
use App\Domains\Inventory\Domain\Models\Inventory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BinLocationController extends Controller
{
    public function index(Request $request, ?string $warehouseId = null): JsonResponse
    {
        $query = BinLocation::query()->orderBy('code');

        if ($warehouseId) {
            $query->where('warehouse_id', $warehouseId);
        } elseif ($request->filled('warehouse_id')) {
            $query->where('warehouse_id', $request->warehouse_id);
        }

        return response()->json(['data' => $query->get()]);
    }

    public function store(Request $request, string $warehouseId): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50'],
            'name' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $warehouse = \App\Domains\Inventory\Domain\Models\StockLocation::findOrFail($warehouseId);

        $exists = BinLocation::where('warehouse_id', $warehouseId)
            ->where('code', $validated['code'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'A bin with this code already exists in this warehouse.',
            ], 422);
        }

        $bin = BinLocation::create([
            'id' => (string) Str::uuid(),
            'warehouse_id' => $warehouseId,
            'code' => $validated['code'],
            'name' => $validated['name'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'message' => 'Bin location created successfully.',
            'data' => $bin,
        ], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $bin = BinLocation::findOrFail($id);

        $validated = $request->validate([
            'code' => ['sometimes', 'string', 'max:50'],
            'name' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        if (isset($validated['code'])) {
            $exists = BinLocation::where('warehouse_id', $bin->warehouse_id)
                ->where('code', $validated['code'])
                ->where('id', '!=', $id)
                ->exists();

            if ($exists) {
                return response()->json([
                    'message' => 'A bin with this code already exists in this warehouse.',
                ], 422);
            }
        }

        $bin->update($validated);

        return response()->json([
            'message' => 'Bin location updated successfully.',
            'data' => $bin,
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $bin = BinLocation::findOrFail($id);

        $hasInventory = Inventory::where('bin_id', $id)->exists();
        if ($hasInventory) {
            return response()->json([
                'message' => 'Cannot delete bin with existing inventory records. Move or remove inventory first.',
            ], 422);
        }

        $bin->delete();

        return response()->json([
            'message' => 'Bin location deleted successfully.',
        ]);
    }
}
