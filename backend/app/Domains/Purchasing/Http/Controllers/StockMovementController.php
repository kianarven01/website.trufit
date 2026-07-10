<?php

namespace App\Domains\Purchasing\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Domains\Purchasing\Domain\Models\StockMovement;

class StockMovementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');
        $type = $request->query('type');
        $perPage = (int) $request->query('per_page', 25);

        $query = StockMovement::with([
            'product.manufacturer',
            'productSupplier.supplier',
            'inventory'
        ]);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('notes', 'ILIKE', "%{$search}%")
                  ->orWhere('reference_id', 'ILIKE', "%{$search}%")
                  ->orWhere('reference_type', 'ILIKE', "%{$search}%")
                  ->orWhereHas('product', function ($pq) use ($search) {
                      $pq->where('name', 'ILIKE', "%{$search}%");
                  });
            });
        }

        if ($type && $type !== 'ALL') {
            $query->where('movement_type', strtoupper($type));
        }

        $paginated = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json([
            'stock_movements' => $paginated->items(),
            'pagination' => [
                'total' => $paginated->total(),
                'per_page' => $paginated->perPage(),
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
            ]
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
