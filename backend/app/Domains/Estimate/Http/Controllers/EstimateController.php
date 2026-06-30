<?php

namespace App\Domains\Estimate\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Estimate\Domain\Repositories\EstimateRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EstimateController extends Controller
{
    public function __construct(
        protected EstimateRepositoryInterface $estimateRepo
    ) {}

    /**
     * List all estimates with customer, vehicle, and items.
     */
    public function index()
    {
        try {
            $estimates = $this->estimateRepo->getAll();

            return response()->json([
                'status' => 'success',
                'data' => $estimates,
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
                'status' => 'nullable|string',
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
                'items.*.quantity' => 'required|numeric',
                'items.*.unit_price' => 'required|numeric',
                'items.*.subtotal' => 'required|numeric',
                'items.*.needs_ordering' => 'nullable|boolean',
                'items.*.custom_name' => 'nullable|string|max:255',
            ]);

            $estimate = $this->estimateRepo->create($validated);

            return response()->json([
                'status' => 'success',
                'data' => $estimate,
            ], 201);
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
                'status' => 'nullable|string',
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
                'items.*.quantity' => 'required|numeric',
                'items.*.unit_price' => 'required|numeric',
                'items.*.subtotal' => 'required|numeric',
                'items.*.needs_ordering' => 'nullable|boolean',
                'items.*.custom_name' => 'nullable|string|max:255',
            ]);

            $estimate = $this->estimateRepo->update($id, $validated);

            return response()->json([
                'status' => 'success',
                'data' => $estimate,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update estimate: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update estimate: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete an existing estimate.
     */
    public function destroy($id)
    {
        try {
            $deleted = $this->estimateRepo->delete($id);

            if (!$deleted) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Failed to delete estimate',
                ], 400);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Estimate deleted successfully',
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

            // Load relations if not already loaded
            if (!$estimate->relationLoaded('customer')) {
                $estimate->load(['customer', 'vehicle', 'items', 'items.service', 'items.product', 'creator']);
            } else {
                $estimate->loadMissing(['creator']);
            }

            $user = auth()->user() ?? auth('sanctum')->user();
            $employee = $estimate->creator ?? ($user ? $user->employee : null);
            if ($employee) {
                $employee->load('role');
            }

            $filename = ($estimate->estimate_number ?: 'estimate-' . str_pad($estimate->id, 5, '0', STR_PAD_LEFT)) . '.pdf';

            return \Spatie\LaravelPdf\Facades\Pdf::view('pdfs.estimate', [
                'estimate' => $estimate,
                'employee' => $employee,
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
