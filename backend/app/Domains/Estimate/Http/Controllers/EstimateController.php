<?php

namespace App\Domains\Estimate\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Estimate\Domain\Repositories\EstimateRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class EstimateController extends Controller
{
    public function __construct(
        protected EstimateRepositoryInterface $estimateRepo
    ) {}

    /**
     * List estimates with server-side pagination, search, and status filter.
     */
    public function index(Request $request)
    {
        try {
            $perPage = min((int) $request->query('per_page', 25), 100);
            $page = (int) $request->query('page', 1);
            $search = $request->query('search', '');
            $status = $request->query('status', '');
            $archived = $request->query('archived') === 'true' || $request->query('archived') == '1';

            $result = $this->estimateRepo->getPaginated($perPage, $page, $search, $status, $archived);

            return response()->json([
                'status' => 'success',
                'data' => $result['data'],
                'meta' => $result['meta'],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch estimates: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch estimates: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Show a single estimate by ID.
     */
    public function show($id)
    {
        try {
            $estimate = $this->estimateRepo->findById($id);

            if (!$estimate) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Estimate not found',
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'data' => $estimate,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch estimate: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch estimate: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a new estimate.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'customer_id' => 'required|exists:App\Domains\Customer\Domain\Models\Customer,customer_id',
                'vehicle_id' => 'required|exists:App\Domains\Customer\Domain\Models\CustomerVehicle,id',
                'status' => 'nullable|string|in:DRAFT,FOR APPROVAL,FOR_APPROVAL,APPROVED,APPROVED WITH DOWNPAYMENT,APPROVED_WITH_DOWNPAYMENT,ISSUED,CANCELLED',
                'total_amount' => 'required|numeric',
                'mileage' => 'required|numeric|min:0',
                'downpayment_amount' => 'nullable|numeric|min:0',
                'payment_method' => 'nullable|string|max:50',
                'payment_reference' => 'nullable|string|max:100',
                'notes' => 'nullable|string',
                'items' => 'required|array',
                'items.*.item_type' => 'required|string|in:service,part,supply',
                'items.*.product_id' => 'nullable|uuid',
                'items.*.service_id' => 'nullable|uuid',
                'items.*.quantity' => 'required|numeric|min:1',
                'items.*.unit_price' => 'required|numeric',
                'items.*.subtotal' => 'required|numeric',
                'items.*.needs_ordering' => 'nullable|boolean',
                'items.*.custom_name' => 'nullable|string|max:255',
                'items.*.is_tentative' => 'nullable|boolean',
            ]);

            $customer = \App\Domains\Customer\Domain\Models\Customer::find($validated['customer_id']);
            if ($customer && $customer->origin === 'appointment') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Cannot create estimate: This customer profile is incomplete.'
                ], 422);
            }

            $estimate = $this->estimateRepo->create($validated);

            return response()->json([
                'status' => 'success',
                'data' => $estimate,
            ], 201);
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Failed to create estimate: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create estimate: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update an existing estimate.
     */
    public function update(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'customer_id' => 'nullable|exists:App\Domains\Customer\Domain\Models\Customer,customer_id',
                'vehicle_id' => 'nullable|exists:App\Domains\Customer\Domain\Models\CustomerVehicle,id',
                'status' => 'nullable|string|in:DRAFT,FOR APPROVAL,FOR_APPROVAL,APPROVED,APPROVED WITH DOWNPAYMENT,APPROVED_WITH_DOWNPAYMENT,ISSUED,CANCELLED',
                'total_amount' => 'nullable|numeric',
                'mileage' => 'nullable|numeric|min:0',
                'downpayment_amount' => 'nullable|numeric|min:0',
                'payment_method' => 'nullable|string|max:50',
                'payment_reference' => 'nullable|string|max:100',
                'notes' => 'nullable|string',
                'items' => 'nullable|array',
                'items.*.item_type' => 'required|string|in:service,part,supply',
                'items.*.product_id' => 'nullable|uuid',
                'items.*.service_id' => 'nullable|uuid',
                'items.*.quantity' => 'required|numeric|min:1',
                'items.*.unit_price' => 'required|numeric',
                'items.*.subtotal' => 'required|numeric',
                'items.*.needs_ordering' => 'nullable|boolean',
                'items.*.custom_name' => 'nullable|string|max:255',
                'items.*.is_tentative' => 'nullable|boolean',
            ]);

            if (isset($validated['customer_id'])) {
                $customer = \App\Domains\Customer\Domain\Models\Customer::find($validated['customer_id']);
                if ($customer && $customer->origin === 'appointment') {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Cannot update estimate: This customer profile is incomplete.'
                    ], 422);
                }
            }

            // Cancel estimate — cascade to linked SO/JO (handled before repo update)
            if (isset($validated['status']) && strtoupper($validated['status']) === 'CANCELLED') {
                $result = app(\App\Domains\Estimate\Application\UseCases\CancelEstimate::class)
                    ->execute($id, $request->user()?->id);

                return response()->json([
                    'status' => 'success',
                    'data' => $result['estimate'],
                    'message' => $result['message'],
                ]);
            }

            $estimate = $this->estimateRepo->update($id, $validated);

            // Auto-create SO + JO when estimate is approved
            if (isset($validated['status']) && in_array(strtoupper($validated['status']), ['APPROVED', 'APPROVED WITH DOWNPAYMENT', 'APPROVED_WITH_DOWNPAYMENT'])) {
                $employeeId = auth()->user() ? auth()->user()->employeeID : null;
                $result = app(\App\Domains\Estimate\Application\UseCases\ApproveEstimate::class)
                    ->execute($id, $employeeId);

                $parts = [];
                if ($result['salesOrder']) $parts[] = 'SO ' . $result['salesOrder']->so_number;
                if ($result['jobOrder']) $parts[] = 'JO ' . $result['jobOrder']->jo_number;

                return response()->json([
                    'status' => 'success',
                    'data' => $result['estimate'],
                    'sales_order' => $result['salesOrder'],
                    'job_order' => $result['jobOrder'],
                    'message' => 'Estimate approved.' . (!empty($parts) ? ' ' . implode(' and ', $parts) . ' created.' : ''),
                ]);
            }

            return response()->json([
                'status' => 'success',
                'data' => $estimate,
            ]);
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('Failed to update estimate: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update estimate: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Soft-delete (archive) an estimate.
     */
    public function destroy(string $id)
    {
        try {
            $estimate = \App\Domains\Estimate\Domain\Models\Estimate::find($id);

            if (!$estimate) {
                return response()->json(['message' => 'Estimate not found.'], 404);
            }

            if (!in_array(strtoupper($estimate->status ?? ''), ['DRAFT', 'CANCELLED'], true)) {
                return response()->json([
                    'message' => 'Only draft or cancelled estimates can be archived.',
                ], 422);
            }

            $estimate->delete();

            return response()->json([
                'message' => 'Estimate archived successfully.',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to archive estimate: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to archive estimate: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Restore an archived estimate.
     */
    public function restore(string $id)
    {
        try {
            $estimate = \App\Domains\Estimate\Domain\Models\Estimate::onlyTrashed()->find($id);

            if (!$estimate) {
                return response()->json(['message' => 'Archived estimate not found.'], 404);
            }

            $estimate->restore();

            return response()->json([
                'message' => 'Estimate restored successfully.',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to restore estimate: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to restore estimate: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Permanently delete an archived estimate.
     */
    public function forceDelete(string $id)
    {
        try {
            $estimate = \App\Domains\Estimate\Domain\Models\Estimate::onlyTrashed()->find($id);

            if (!$estimate) {
                return response()->json(['message' => 'Estimate not found.'], 404);
            }

            DB::transaction(function () use ($estimate) {
                // Delete estimate items
                $estimate->items()->delete();
                $estimate->forceDelete();
            });

            return response()->json([
                'message' => 'Estimate permanently deleted.',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete estimate: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete estimate: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Download Estimate as PDF.
     */
    public function downloadPdf($id)
    {
        try {
            $estimate = $this->estimateRepo->findById($id);

            if (!$estimate) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Estimate not found',
                ], 404);
            }

            $estimate->loadMissing(['customer', 'vehicle', 'items.service', 'items.product.manufacturer', 'creator.employee']);

            $employee = $estimate->creator?->employee ?? auth()->user()?->employee;
            if ($employee) {
                $employee->load('role');
            }

            $filename = ($estimate->estimate_number ?: 'estimate-' . str_pad($estimate->id, 5, '0', STR_PAD_LEFT)) . '.pdf';
            $hidePartNumber = request()->query('hide_part_number') === 'true' || request()->query('hide_part_number') === '1';
            $includeTentative = request()->query('include_tentative') === 'true' || request()->query('include_tentative') === '1';

            return \Spatie\LaravelPdf\Facades\Pdf::view('pdfs.estimate', [
                'estimate' => $estimate,
                'employee' => $employee,
                'hidePartNumber' => $hidePartNumber,
                'includeTentative' => $includeTentative,
            ])
            ->format('a4')
            ->inline($filename);
        } catch (\Exception $e) {
            Log::error('Failed to generate estimate PDF: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to generate estimate PDF: ' . $e->getMessage(),
            ], 500);
        }
    }
}
