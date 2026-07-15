<?php

namespace App\Domains\SalesOrder\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\SalesOrder\Http\Controllers\Traits\HandlesUseCaseErrors;
use App\Domains\SalesOrder\Domain\Models\SalesOrder;
use App\Domains\SalesOrder\Application\Services\ReserveInventoryService;
use App\Domains\SalesOrder\Application\UseCases\CreateSalesOrder;
use App\Domains\SalesOrder\Application\UseCases\SubmitSalesOrder;
use App\Domains\SalesOrder\Application\UseCases\ApproveSalesOrder;
use App\Domains\SalesOrder\Application\UseCases\UpdateSalesOrder;
use App\Domains\SalesOrder\Application\UseCases\CloseSalesOrder;
use App\Domains\SalesOrder\Application\UseCases\ReopenSalesOrder;
use App\Domains\SalesOrder\Application\UseCases\CancelSalesOrder;
use App\Domains\SalesOrder\Application\UseCases\StartWorkSalesOrder;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Spatie\LaravelPdf\Facades\Pdf;

class SalesOrderController extends Controller
{
    use HandlesUseCaseErrors;

    public function __construct(
        protected ReserveInventoryService $reserveInventoryService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');
        $status = $request->query('status');
        $archived = $request->query('archived') === 'true' || $request->query('archived') == '1';
        $perPage = $this->clampPerPage($request->query('per_page', 25));

        $query = SalesOrder::with([
            'customer',
            'vehicle',
            'items.product.productSuppliers.inventory',
            'creator',
            'approver',
            'approvedByEmployee',
            'submittedByUser.employee',
            'cancelledByUser.employee',
        ]);

        if ($archived) {
            $query->onlyTrashed();
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('so_number', 'ILIKE', "%{$search}%")
                  ->orWhereHas('customer', function ($cq) use ($search) {
                      $cq->where('first_name', 'ILIKE', "%{$search}%")
                         ->orWhere('last_name', 'ILIKE', "%{$search}%");
                  });
            });
        }

        if ($status && $status !== 'ALL') {
            $statuses = array_map('strtoupper', array_map('trim', explode(',', $status)));
            $query->whereIn('Status', $statuses);
        }

        $paginated = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json([
            'data' => $paginated->items(),
            'pagination' => [
                'total' => $paginated->total(),
                'per_page' => $paginated->perPage(),
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
            ],
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $order = SalesOrder::with([
            'customer',
            'vehicle',
            'estimate',
            'items.product.manufacturer',
            'items.product.productSuppliers.inventory',
            'items.product.inventoryRows',
            'creator',
            'approver',
            'approvedByEmployee',
            'submittedByUser.employee',
            'cancelledByUser.employee',
        ])->find($id);

        if (!$order) {
            return response()->json(['message' => 'Sales Order not found.'], 404);
        }

        return response()->json(['data' => $order]);
    }

    public function store(Request $request, CreateSalesOrder $createSalesOrder): JsonResponse
    {
        try {
            $validated = $request->validate([
                'estimate_id' => 'nullable|exists:App\Domains\Estimate\Domain\Models\Estimate,id',
                'customer_id' => 'required_without:estimate_id|exists:App\Domains\Customer\Domain\Models\Customer,customer_id',
                'vehicle_id' => 'nullable|exists:App\Domains\Customer\Domain\Models\CustomerVehicle,id',
                'mileage' => 'nullable|integer|min:0',
                'notes' => 'nullable|string',
                'items' => 'required_without:estimate_id|array|min:1',
                'items.*.product_id' => 'required|uuid',
                'items.*.quantity' => 'required|numeric|min:1',
                'items.*.unit_price' => 'required|numeric|min:0',
                'items.*.needs_ordering' => 'nullable|boolean',
            ]);

            $order = $createSalesOrder->execute($validated, $request->user()?->id);

            return response()->json([
                'message' => 'Sales Order created successfully.',
                'data' => $order,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return $this->handleUseCaseException($e, 'create sales order');
        }
    }

    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'customer_id' => 'nullable|exists:App\Domains\Customer\Domain\Models\Customer,customer_id',
                'vehicle_id' => 'nullable|exists:App\Domains\Customer\Domain\Models\CustomerVehicle,id',
                'mileage' => 'nullable|integer|min:0',
                'notes' => 'nullable|string',
                'items' => 'nullable|array|min:1',
                'items.*.product_id' => 'required_with:items|uuid',
                'items.*.quantity' => 'required_with:items|numeric|min:1',
                'items.*.unit_price' => 'required_with:items|numeric|min:0',
                'items.*.needs_ordering' => 'nullable|boolean',
            ]);

            $useCase = new UpdateSalesOrder();
            $order = $useCase->execute($id, $validated);

            return response()->json([
                'message' => 'Sales Order updated successfully.',
                'data' => $order,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return $this->handleUseCaseException($e, 'update sales order');
        }
    }

    public function submit(string $id, Request $request, SubmitSalesOrder $submitSalesOrder): JsonResponse
    {
        try {
            $order = $submitSalesOrder->execute($id, $request->user()?->id);

            return response()->json([
                'message' => 'Sales Order submitted for approval.',
                'data' => $order,
            ]);
        } catch (\Exception $e) {
            return $this->handleUseCaseException($e, 'submit sales order');
        }
    }

    public function approve(string $id, Request $request, ApproveSalesOrder $approveSalesOrder): JsonResponse
    {
        try {
            $order = $approveSalesOrder->execute($id, $request->user()?->employeeID);

            return response()->json([
                'message' => 'Sales Order approved and stock reserved successfully.',
                'data' => $order,
            ]);
        } catch (\Exception $e) {
            return $this->handleUseCaseException($e, 'approve sales order');
        }
    }

    public function startWork(string $id, Request $request, StartWorkSalesOrder $startWorkSalesOrder): JsonResponse
    {
        try {
            $order = $startWorkSalesOrder->execute($id, $request->user()?->id);

            return response()->json([
                'message' => 'Sales Order work started.',
                'data' => $order,
            ]);
        } catch (\Exception $e) {
            return $this->handleUseCaseException($e, 'start work on sales order');
        }
    }

    public function close(string $id, Request $request, CloseSalesOrder $closeSalesOrder): JsonResponse
    {
        try {
            $order = $closeSalesOrder->execute($id, $request->user()?->id);

            return response()->json([
                'message' => 'Sales Order completed successfully.',
                'data' => $order,
            ]);
        } catch (\Exception $e) {
            return $this->handleUseCaseException($e, 'complete sales order');
        }
    }

    public function reopen(string $id, Request $request, ReopenSalesOrder $reopenSalesOrder): JsonResponse
    {
        try {
            $order = $reopenSalesOrder->execute($id, $request->user()?->id);

            return response()->json([
                'message' => 'Sales Order reopened successfully.',
                'data' => $order,
            ]);
        } catch (\Exception $e) {
            return $this->handleUseCaseException($e, 'reopen sales order');
        }
    }

    public function cancel(string $id, Request $request, CancelSalesOrder $cancelSalesOrder): JsonResponse
    {
        try {
            $order = $cancelSalesOrder->execute($id, $request->user()?->id);

            return response()->json([
                'message' => 'Sales Order cancelled successfully. Stock has been released.',
                'data' => $order,
            ]);
        } catch (\Exception $e) {
            return $this->handleUseCaseException($e, 'cancel sales order');
        }
    }

    public function destroy(string $id): JsonResponse
    {
        $order = SalesOrder::find($id);

        if (!$order) {
            return response()->json(['message' => 'Sales Order not found.'], 404);
        }

        if (!in_array($order->Status, ['DRAFT', 'CANCELLED'], true)) {
            return response()->json([
                'message' => 'Only draft or cancelled sales orders can be archived.',
            ], 422);
        }

        $order->delete();

        return response()->json([
            'message' => 'Sales Order archived successfully.',
        ]);
    }

    public function restore(string $id): JsonResponse
    {
        $order = SalesOrder::onlyTrashed()->find($id);

        if (!$order) {
            return response()->json(['message' => 'Archived Sales Order not found.'], 404);
        }

        $order->restore();

        return response()->json([
            'message' => 'Sales Order restored successfully.',
        ]);
    }

    public function forceDelete(string $id): JsonResponse
    {
        $order = SalesOrder::onlyTrashed()->find($id);

        if (!$order) {
            return response()->json([
                'message' => 'Only archived sales orders can be permanently deleted.',
            ], 422);
        }

        DB::transaction(function () use ($order) {
            $order->items()->delete();
            $order->forceDelete();
        });

        return response()->json([
            'message' => 'Sales Order permanently deleted.',
        ]);
    }

    public function downloadPdf(string $id)
    {
        $order = SalesOrder::with([
            'customer',
            'vehicle',
            'items.product',
            'creator',
            'approver',
        ])->findOrFail($id);

        $filename = 'SO-' . ($order->so_number ?? str_pad(substr($order->id, 0, 8), 8, '0', STR_PAD_LEFT)) . '.pdf';

        return Pdf::view('pdfs.sales-order', [
            'salesOrder' => $order,
        ])->format('a4')->inline($filename);
    }
}
