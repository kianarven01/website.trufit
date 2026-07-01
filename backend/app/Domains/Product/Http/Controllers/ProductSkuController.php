<?php

namespace App\Domains\Product\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Product\Application\Services\ProductSkuService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductSkuController extends Controller
{
    public function __construct(private ProductSkuService $skuService)
    {
    }

    public function preview(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'manufacturer_id' => ['required', 'integer'],
            'part_id' => ['required', 'integer'],
        ]);

        return response()->json([
            'sku' => $this->skuService->generate(
                (int) $validated['manufacturer_id'],
                (int) $validated['part_id']
            ),
        ]);
    }
}
