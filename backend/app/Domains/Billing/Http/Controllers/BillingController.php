<?php

namespace App\Domains\Billing\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Billing\Domain\Models\BillingStatement;
use App\Domains\Billing\Application\UseCases\CreateBillingStatement;
use App\Domains\Billing\Application\UseCases\AddPaymentToBillingStatement;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class BillingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');
        $status = $request->query('status');
        $perPage = (int)$request->query('per_page', 25);
        $archived = $request->query('archived') === 'true';

        $query = BillingStatement::with([
            'customer',
            'vehicle',
            'salesOrder.items.product',
            'jobOrder',
            'payments',
            'items',
        ]);

        if ($archived) {
            $query->onlyTrashed();
        }

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('bill_number', 'ILIKE', "%{$search}%")
                  ->orWhereHas('customer', function ($cq) use ($search) {
                      $cq->where('first_name', 'ILIKE', "%{$search}%")
                         ->orWhere('last_name', 'ILIKE', "%{$search}%");
                  })
                  ->orWhereHas('vehicle', function ($vq) use ($search) {
                      $vq->where('plate_number', 'ILIKE', "%{$search}%");
                  });
            });
        }

        $results = $query->orderBy('Date', 'desc')->paginate($perPage);

        return response()->json($results);
    }

    public function show(string $id): JsonResponse
    {
        $statement = BillingStatement::withTrashed()->with([
            'customer',
            'vehicle',
            'salesOrder.items.product.manufacturer',
            'jobOrder',
            'payments',
            'items',
        ])->findOrFail($id);

        return response()->json([
            'data' => $statement
        ]);
    }

    public function store(Request $request, CreateBillingStatement $useCase): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:Customers,customer_id',
            'vehicle_id' => 'nullable|exists:CustomerVehicles,id',
            'so_id' => 'nullable|exists:SalesOrder,id',
            'jo_id' => 'nullable|exists:JobOrder,id',
            'date' => 'nullable|date',
            'total' => 'required|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'items' => 'nullable|array',
            'items.*.name' => 'required_with:items|string',
            'items.*.qty' => 'required_with:items|integer|min:1',
            'items.*.price' => 'required_with:items|numeric|min:0',
            'items.*.amount' => 'nullable|numeric|min:0',
            'items.*.type' => 'nullable|string|in:service,part,supply',
            'payment' => 'nullable|array',
            'payment.amount' => 'nullable|numeric|min:0',
            'payment.method' => 'nullable|string',
            'payment.reference_number' => 'nullable|string',
            'payment.type' => 'nullable|string',
        ]);

        $statement = $useCase->execute($validated);

        return response()->json([
            'message' => 'Billing statement created successfully',
            'data' => $statement
        ], 201);
    }

    public function addPayment(string $id, Request $request, AddPaymentToBillingStatement $useCase): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'method' => 'required|string',
            'reference_number' => 'nullable|string',
            'type' => 'nullable|string',
        ]);

        $statement = $useCase->execute($id, $validated);

        return response()->json([
            'message' => 'Payment recorded successfully',
            'data' => $statement
        ]);
    }

    public function updateDiscount(string $id, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'discount_type' => 'nullable|string|in:fixed,percent',
            'discount_value' => 'nullable|numeric|min:0',
        ]);

        $statement = BillingStatement::findOrFail($id);

        if (in_array($statement->status, ['Paid', 'Cancelled'])) {
            return response()->json([
                'message' => 'Cannot modify discount on a paid or cancelled billing statement.',
            ], 422);
        }

        $discountType = $validated['discount_type'] ?? null;
        $discountValue = $validated['discount_value'] ?? 0;

        if ($discountType === 'percent' && $discountValue > 100) {
            return response()->json([
                'message' => 'Percentage discount cannot exceed 100%.',
            ], 422);
        }

        $statement->update([
            'discount_type' => $discountType,
            'discount_value' => $discountValue,
        ]);

        return response()->json([
            'message' => 'Discount updated successfully.',
            'data' => $statement->fresh(),
        ]);
    }

    public function updateNotes(string $id, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'notes' => 'nullable|string',
        ]);

        $statement = BillingStatement::findOrFail($id);
        $statement->update(['notes' => $validated['notes'] ?? null]);

        return response()->json([
            'message' => 'Notes updated successfully.',
            'data' => $statement->fresh(),
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $statement = BillingStatement::findOrFail($id);

        if ($statement->status !== 'Cancelled') {
            return response()->json([
                'message' => 'Only cancelled billing statements can be archived.',
            ], 422);
        }

        $statement->delete();

        return response()->json([
            'message' => 'Billing statement archived successfully.',
        ]);
    }

    public function restore(string $id): JsonResponse
    {
        $statement = BillingStatement::onlyTrashed()->findOrFail($id);
        $statement->restore();

        return response()->json([
            'message' => 'Billing statement restored successfully.',
        ]);
    }

    public function forceDelete(string $id): JsonResponse
    {
        $statement = BillingStatement::onlyTrashed()->findOrFail($id);

        if ($statement->status === 'Paid') {
            return response()->json([
                'message' => 'Paid billing statements cannot be permanently deleted.',
            ], 422);
        }

        DB::transaction(function () use ($statement) {
            $statement->payments()->delete();
            $statement->items()->delete();
            $statement->forceDelete();
        });

        return response()->json([
            'message' => 'Billing statement permanently deleted.',
        ]);
    }
}
