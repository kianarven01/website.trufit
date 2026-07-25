<?php

namespace App\Domains\JobOrder\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\JobOrder\Domain\Models\JobOrder;
use App\Domains\JobOrder\Domain\Models\JobOrderService;
use App\Domains\JobOrder\Domain\Models\JobOrderTechnician;
use App\Domains\JobOrder\Application\UseCases\StartTimer;
use App\Domains\JobOrder\Application\UseCases\PauseTimer;
use App\Domains\JobOrder\Application\UseCases\ResumeTimer;
use App\Domains\JobOrder\Application\UseCases\StopTimer;
use App\Domains\JobOrder\Application\UseCases\AssignTechnician;
use App\Domains\JobOrder\Application\UseCases\RemoveTechnician;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class JobOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');
        $status = $request->query('status');
        $perPage = (int) $request->query('per_page', 25);

        $query = JobOrder::with([
            'technicians.employee',
            'services.serviceType',
            'salesOrder',
            'vehicle',
            'statusRecord',
        ]);

        if ($status && $status !== 'all') {
            $query->whereHas('statusRecord', function ($q) use ($status) {
                $q->where('name', $status);
            });
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('jo_number', 'ILIKE', "%{$search}%")
                  ->orWhereHas('technicians.employee', function ($tq) use ($search) {
                      $tq->where('first_name', 'ILIKE', "%{$search}%")
                         ->orWhere('last_name', 'ILIKE', "%{$search}%");
                  })
                  ->orWhereHas('vehicle', function ($vq) use ($search) {
                      $vq->where('plate_number', 'ILIKE', "%{$search}%");
                  });
            });
        }

        $results = $query->orderBy('date', 'desc')->paginate($perPage);

        // Compute technicianName and statusRecord from eager-loaded data (avoids N+1)
        $results->getCollection()->transform(function ($jo) {
            $jo->technicianName = $jo->technicians
                ->filter(fn($t) => is_null($t->removed_at) && $t->employee)
                ->map(fn($t) => trim($t->employee->first_name . ' ' . $t->employee->last_name))
                ->values()
                ->implode(', ') ?: null;
            $jo->statusRecord = $jo->statusRecord
                ? $jo->statusRecord->only(['id', 'name', 'category'])
                : null;
            return $jo;
        });

        return response()->json($results);
    }

    public function show(string $id): JsonResponse
    {
        $jobOrder = JobOrder::with([
            'technicians.employee',
            'services.serviceType',
            'salesOrder.items.product.category',
            'vehicle',
            'billingStatements',
            'statusRecord',
        ])->findOrFail($id);

        // Add computed elapsed seconds, technicianName, statusRecord, and salesOrder
        $data = $jobOrder->toArray();
        $data['elapsed_seconds'] = $jobOrder->elapsed_seconds;
        $data['technicianName'] = $jobOrder->technicians
            ->filter(fn($t) => is_null($t->removed_at) && $t->employee)
            ->map(fn($t) => trim($t->employee->first_name . ' ' . $t->employee->last_name))
            ->values()
            ->implode(', ') ?: null;
        $data['statusRecord'] = $jobOrder->statusRecord
            ? $jobOrder->statusRecord->only(['id', 'name', 'category'])
            : null;
        // Include salesOrder with items (belongsTo not in toArray)
        if ($jobOrder->salesOrder) {
            $so = $jobOrder->salesOrder;
            $data['salesOrder'] = [
                'id' => $so->id,
                'so_number' => $so->so_number,
                'Status' => $so->Status,
                'Total' => $so->Total,
                'items' => $so->items->map(fn($item) => [
                    'id' => $item->id,
                    'ProductID' => $item->ProductID,
                    'custom_name' => $item->custom_name,
                    'quantity' => $item->quantity,
                    'UnitPrice' => $item->UnitPrice,
                    'SubTotal' => $item->SubTotal,
                    'is_issued' => (bool) $item->is_issued,
                    'product' => $item->product ? [
                        'name' => $item->product->name,
                        'SKU' => $item->product->SKU,
                        'part_number' => $item->product->part_number,
                        'manufacturer_name' => $item->product->manufacturer_name,
                        'category_is_spol' => $item->product->category?->is_spol,
                        'category_name' => $item->product->category?->name,
                    ] : null,
                ])->toArray(),
            ];
        } else {
            $data['salesOrder'] = null;
        }

        return response()->json(['data' => $data]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'vehicle_id' => 'required|exists:CustomerVehicles,id',
            'technician_id' => 'nullable|exists:Employees,id',
            'sale_order_id' => 'nullable|exists:SalesOrder,id',
            'date' => 'nullable|date',
            'services' => 'nullable|array',
            'services.*.service_id' => 'nullable|exists:ServiceType,id',
            'services.*.custom_name' => 'nullable|string|max:255',
            'services.*.price' => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($validated) {
            $pendingStatusId = $this->getStatusId('Pending');
            $joNumber = JobOrder::generateJoNumber();

            $jobOrder = JobOrder::create([
                'jo_number' => $joNumber,
                'SaleOrderID' => $validated['sale_order_id'] ?? null,
                'VehicleID' => '',
                'TechnicianID' => $validated['technician_id'] ?? null,
                'date' => $validated['date'] ?? now(),
                'status' => $pendingStatusId,
                'vehicle_id_new' => $validated['vehicle_id'],
            ]);

            if (!empty($validated['services'])) {
                foreach ($validated['services'] as $svc) {
                    if (empty($svc['service_id']) && empty($svc['custom_name'])) continue;

                    JobOrderService::create([
                        'JobOrderID' => $jobOrder->id,
                        'ServiceID' => $svc['service_id'] ?? null,
                        'custom_name' => $svc['custom_name'] ?? null,
                        'PriceAtSale' => $svc['price'] ?? 0,
                    ]);
                }
            }

            // Create JobOrderTechnician record if technician_id provided
            if (!empty($validated['technician_id'])) {
                JobOrderTechnician::create([
                    'JobOrderID' => $jobOrder->id,
                    'employee_id' => $validated['technician_id'],
                    'role' => 'PRIMARY',
                    'assigned_at' => now(),
                ]);
            }

            if (!empty($validated['sale_order_id'])) {
                DB::connection('pgsql')
                    ->table('Main.SalesOrder')
                    ->where('id', $validated['sale_order_id'])
                    ->update(['job_order_id' => $jobOrder->id]);
            }

            return response()->json([
                'message' => 'Job order created successfully',
                'data' => $jobOrder->fresh(['technicians.employee', 'services.serviceType', 'vehicle']),
            ], 201);
        });
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $jobOrder = JobOrder::findOrFail($id);

        $validated = $request->validate([
            'vehicle_id' => 'sometimes|required|exists:CustomerVehicles,id',
            'technician_id' => 'nullable|exists:Employees,id',
            'notes' => 'nullable|string',
            'services' => 'nullable|array',
            'services.*.service_id' => 'nullable|exists:ServiceType,id',
            'services.*.custom_name' => 'nullable|string|max:255',
            'services.*.price' => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($jobOrder, $validated) {
            $updateData = [];
            if (isset($validated['vehicle_id'])) {
                $updateData['vehicle_id_new'] = $validated['vehicle_id'];
            }
            if (array_key_exists('notes', $validated)) {
                $updateData['notes'] = $validated['notes'];
            }

            if (!empty($updateData)) {
                $jobOrder->update($updateData);
            }

            if (isset($validated['services'])) {
                $jobOrder->services()->delete();
                foreach ($validated['services'] as $svc) {
                    if (empty($svc['service_id']) && empty($svc['custom_name'])) continue;

                    JobOrderService::create([
                        'JobOrderID' => $jobOrder->id,
                        'ServiceID' => $svc['service_id'] ?? null,
                        'custom_name' => $svc['custom_name'] ?? null,
                        'PriceAtSale' => $svc['price'] ?? 0,
                    ]);
                }
            }

            // Handle technician assignment
            if (array_key_exists('technician_id', $validated)) {
                // Remove existing active technicians
                $jobOrder->technicians()->whereNull('removed_at')->update(['removed_at' => now()]);
                // Add new technician if provided
                if (!empty($validated['technician_id'])) {
                    JobOrderTechnician::create([
                        'JobOrderID' => $jobOrder->id,
                        'employee_id' => $validated['technician_id'],
                        'role' => 'PRIMARY',
                        'assigned_at' => now(),
                    ]);
                }
            }

            return response()->json([
                'message' => 'Job order updated successfully',
                'data' => $jobOrder->fresh(['technicians.employee', 'services.serviceType', 'vehicle']),
            ]);
        });
    }

    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $jobOrder = JobOrder::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|string|in:In Progress,Completed,Cancelled',
        ]);

        $currentStatusName = $jobOrder->statusRecord?->name ?? null;

        $allowedTransitions = [
            'Pending' => ['In Progress', 'Cancelled'],
            'In Progress' => ['Completed', 'Cancelled'],
        ];

        if (!isset($allowedTransitions[$currentStatusName]) || !in_array($validated['status'], $allowedTransitions[$currentStatusName])) {
            return response()->json([
                'message' => "Cannot transition from \"{$currentStatusName}\" to \"{$validated['status']}\".",
            ], 422);
        }

        $soStarted = false;
        $soCompleted = false;

        // When JO starts, sync SO to IN_PROGRESS
        if ($validated['status'] === 'In Progress') {
            $jobOrder->load('salesOrder');
            if ($jobOrder->salesOrder && $jobOrder->salesOrder->Status === 'APPROVED') {
                $jobOrder->salesOrder->update([
                    'Status' => 'IN_PROGRESS',
                    'started_by' => $request->user()?->id,
                    'started_at' => now(),
                ]);
                $soStarted = true;
            }
        }

        // When JO completes, validate + complete SO FIRST (before updating JO status or stopping timer)
        // This will throw if items aren't issued, preventing JO from being marked Completed and timer from stopping
        if ($validated['status'] === 'Completed') {
            $jobOrder->load('salesOrder');
            if ($jobOrder->salesOrder && $jobOrder->salesOrder->Status === 'IN_PROGRESS') {
                app(\App\Domains\SalesOrder\Application\UseCases\CompleteSalesOrder::class)
                    ->execute($jobOrder->salesOrder->id, $request->user()?->id);
                $soCompleted = true;
            } else {
                // JO-only or SO in wrong state — create billing from JO services directly
                app(\App\Domains\JobOrder\Application\UseCases\CompleteJobOrder::class)
                    ->execute($jobOrder->id, $request->user()?->id);
            }
        }

        // Now safe to stop timer and update JO status (no exception = SO completed/billing created OK)
        if (in_array($validated['status'], ['Completed', 'Cancelled']) && $jobOrder->timer_status) {
            app(StopTimer::class)->execute($id);
        }

        $newStatusId = $this->getStatusId($validated['status']);
        $jobOrder->update(['status' => $newStatusId]);

        $freshData = $jobOrder->fresh(['technicians.employee', 'services.serviceType', 'vehicle', 'statusRecord', 'salesOrder'])->toArray();
        $freshData['statusRecord'] = $jobOrder->fresh()->statusRecord
            ? $jobOrder->fresh()->statusRecord->only(['id', 'name', 'category'])
            : null;

        return response()->json([
            'message' => 'Job order status updated successfully',
            'data' => $freshData,
            'so_completed' => $soCompleted,
            'so_started' => $soStarted,
        ]);
    }

    // ── Timer Endpoints ───────────────────────────────────────

    public function startTimer(string $id, StartTimer $useCase): JsonResponse
    {
        try {
            $jobOrder = $useCase->execute($id);
            $data = $jobOrder->toArray();
            $data['elapsed_seconds'] = $jobOrder->elapsed_seconds;

            return response()->json([
                'message' => 'Timer started',
                'data' => $data,
            ]);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 422);
        }
    }

    public function pauseTimer(string $id, PauseTimer $useCase): JsonResponse
    {
        try {
            $jobOrder = $useCase->execute($id);
            $data = $jobOrder->toArray();
            $data['elapsed_seconds'] = $jobOrder->elapsed_seconds;

            return response()->json([
                'message' => 'Timer paused',
                'data' => $data,
            ]);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 422);
        }
    }

    public function resumeTimer(string $id, ResumeTimer $useCase): JsonResponse
    {
        try {
            $jobOrder = $useCase->execute($id);
            $data = $jobOrder->toArray();
            $data['elapsed_seconds'] = $jobOrder->elapsed_seconds;

            return response()->json([
                'message' => 'Timer resumed',
                'data' => $data,
            ]);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 422);
        }
    }

    public function stopTimer(string $id, StopTimer $useCase): JsonResponse
    {
        try {
            $jobOrder = $useCase->execute($id);
            $data = $jobOrder->toArray();
            $data['elapsed_seconds'] = $jobOrder->elapsed_seconds;

            return response()->json([
                'message' => 'Timer stopped',
                'data' => $data,
            ]);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 422);
        }
    }

    // ── Technician Endpoints ──────────────────────────────────

    public function assignTechnician(Request $request, string $id, AssignTechnician $useCase): JsonResponse
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:Employees,id',
            'role' => 'nullable|string|in:PRIMARY,ASSISTANT',
        ]);

        try {
            $assignment = $useCase->execute($id, $validated['employee_id'], $validated['role'] ?? 'PRIMARY');

            return response()->json([
                'message' => 'Technician assigned',
                'data' => $assignment->load('employee'),
            ], 201);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 422);
        }
    }

    public function removeTechnician(string $id, int $technicianId, RemoveTechnician $useCase): JsonResponse
    {
        try {
            $assignment = $useCase->execute($id, $technicianId);

            return response()->json([
                'message' => 'Technician removed',
                'data' => $assignment->load('employee'),
            ]);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], $e->getCode() ?: 422);
        }
    }

    public function getTechnicians(string $id): JsonResponse
    {
        $jobOrder = JobOrder::findOrFail($id);
        $technicians = $jobOrder->technicians()->with('employee')->get();

        return response()->json(['data' => $technicians]);
    }

    // ── Helpers ───────────────────────────────────────────────

    private function getStatusId(string $name): string
    {
        $status = DB::connection('pgsql')
            ->table('Main.Status')
            ->where('name', $name)
            ->where('category', 'JOB_ORDER')
            ->first();

        if (!$status) {
            throw new \RuntimeException("Status \"{$name}\" not found for JOB_ORDER category.");
        }

        return $status->id;
    }
}
