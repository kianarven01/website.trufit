<?php

namespace App\Domains\Purchasing\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use App\Domains\Purchasing\Domain\Models\StockMovement;

class StockMovementController extends Controller
{
    public function index(): JsonResponse
    {
        $movements = StockMovement::with(['product', 'productSupplier', 'inventory'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'stock_movements' => $movements,
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $movement = StockMovement::with(['product', 'productSupplier', 'inventory'])
            ->findOrFail($id);

        return response()->json([
            'stock_movement' => $movement,
        ]);
    }
}
