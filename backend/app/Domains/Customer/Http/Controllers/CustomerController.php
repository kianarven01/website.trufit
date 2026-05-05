<?php

namespace App\Domains\Customer\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Domains\Customer\Domain\Models\Customer;
use App\Domains\Customer\Domain\Models\CustomerVehicle;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CustomerController extends Controller
{
    public function index()
    {
        $customers = Customer::with('vehicles.vehicleVariant.vehicleModel.manufacturer')->get();
        return response()->json([
            'status' => 'success',
            'data' => $customers
        ]);
    }

    public function show($id)
    {
        $customer = Customer::with('vehicles.vehicleVariant.vehicleModel.manufacturer')->find($id);
        if (!$customer) {
            return response()->json(['status' => 'error', 'message' => 'Customer not found'], 404);
        }
        return response()->json([
            'status' => 'success',
            'data' => $customer
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'mobile_number' => 'required|string',
            'address' => 'required|string',
            'landline' => 'nullable|string',
            'email' => 'nullable|email',
            'business' => 'nullable|string',
            'vehicles' => 'array'
        ]);

        try {
            DB::beginTransaction();

            $customer = Customer::create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'mobile_number' => $validated['mobile_number'],
                'address' => $validated['address'],
                'landline' => $validated['landline'],
                'email' => $validated['email'],
                'business' => $validated['business'],
            ]);

            $vehiclesInput = $request->input('vehicles', []);
            if (!empty($vehiclesInput)) {
                foreach ($vehiclesInput as $vehicleData) {
                    CustomerVehicle::create([
                        'customerID' => $customer->customer_id,
                        'plate_number' => $vehicleData['plateNo'] ?? '',
                        'engine_number' => $vehicleData['engineNo'] ?? '',
                        'VIN' => $vehicleData['vin'] ?? '',
                        'color' => $vehicleData['color'] ?? '',
                        'registration _number' => $vehicleData['registrationNo'] ?? '',
                        'year_model' => (string)($vehicleData['year'] ?? ''),
                        'make' => $vehicleData['make'] ?? '',
                        'model' => $vehicleData['model'] ?? '',
                        'variant' => $vehicleData['variant'] ?? '',
                        'selling_dealer' => $vehicleData['sellingDealer'] ?? '',
                        'variant_id' => $vehicleData['variant_id'] ?? null 
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Customer created successfully',
                'data' => $customer->load('vehicles')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Customer creation failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create customer: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'mobile_number' => 'required|string',
            'address' => 'required|string',
            'landline' => 'nullable|string',
            'email' => 'nullable|email',
            'business' => 'nullable|string',
            'vehicles' => 'array'
        ]);

        try {
            DB::beginTransaction();

            $customer = Customer::findOrFail($id);
            $customer->update([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'mobile_number' => $validated['mobile_number'],
                'address' => $validated['address'],
                'landline' => $validated['landline'],
                'email' => $validated['email'],
                'business' => $validated['business'],
            ]);

            // Sync vehicles
            // Remove existing vehicles first to replace with updated list
            CustomerVehicle::where('customerID', $id)->delete();

            $vehiclesInput = $request->input('vehicles', []);
            if (!empty($vehiclesInput)) {
                foreach ($vehiclesInput as $vehicleData) {
                    CustomerVehicle::create([
                        'customerID' => $id,
                        'plate_number' => $vehicleData['plateNo'] ?? '',
                        'engine_number' => $vehicleData['engineNo'] ?? '',
                        'VIN' => $vehicleData['vin'] ?? '',
                        'color' => $vehicleData['color'] ?? '',
                        'registration _number' => $vehicleData['registrationNo'] ?? '',
                        'year_model' => (string)($vehicleData['year'] ?? ''),
                        'make' => $vehicleData['make'] ?? '',
                        'model' => $vehicleData['model'] ?? '',
                        'variant' => $vehicleData['variant'] ?? '',
                        'selling_dealer' => $vehicleData['sellingDealer'] ?? '',
                        'variant_id' => $vehicleData['variant_id'] ?? null 
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Customer updated successfully',
                'data' => $customer->load('vehicles')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Customer update failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update customer: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $customer = Customer::findOrFail($id);

            // Delete associated vehicles first (FK constraint)
            CustomerVehicle::where('customerID', $id)->delete();

            $customer->delete();

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Customer removed successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Customer deletion failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to remove customer: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroyVehicle($customerId, $plateNumber)
    {
        try {
            $vehicle = CustomerVehicle::where('customerID', $customerId)
                ->where('plate_number', $plateNumber)
                ->firstOrFail();

            $vehicle->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Vehicle removed successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Vehicle deletion failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to remove vehicle: ' . $e->getMessage()
            ], 500);
        }
    }
}
