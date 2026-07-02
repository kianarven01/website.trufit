<?php

namespace App\Domains\Product\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Product\Application\Services\ProductVehicleCompatibilityService;
use App\Domains\Product\Domain\Models\Product;
use App\Domains\Product\Domain\Models\ProductVehicleCompatibility;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductVehicleCompatibilityController extends Controller
{
    public function __construct(private ProductVehicleCompatibilityService $compatibilityService)
    {
    }

    public function store(Request $request, string $productId): JsonResponse
    {
        $validated = $request->validate([
            'car_variant_id' => ['required', 'integer'],
            'notes' => ['nullable', 'string'],
            'apply_to_equivalents' => ['nullable', 'boolean'],
        ]);

        $product = Product::findOrFail($productId);
        $result = $this->compatibilityService->addCompatibility($product, $validated);

        return response()->json([
            'message' => 'Vehicle compatibility saved successfully.',
            'created_count' => $result['created_count'],
            'equivalent_created_count' => $result['equivalent_created_count'],
        ]);
    }

    public function syncToEquivalents(string $productId): JsonResponse
    {
        $product = Product::findOrFail($productId);
        $result = $this->compatibilityService->syncToEquivalents($product);

        return response()->json($result);
    }

    public function destroy(string $productId, string $compatibilityId): JsonResponse
    {
        $product = Product::findOrFail($productId);
        $compatibility = ProductVehicleCompatibility::where('product_id', $productId)->findOrFail($compatibilityId);
        $compatibility->delete();

        return response()->json([
            'message' => 'Vehicle compatibility removed successfully.',
        ]);
    }
}
