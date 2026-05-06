<?php

namespace App\Domains\Customer\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Domains\Customer\Application\DTOs\CustomerDTO;
use App\Domains\Customer\Application\UseCases\CreateCustomer;
use App\Domains\Customer\Application\UseCases\UpdateCustomer;
use App\Domains\Customer\Application\UseCases\DeleteCustomer;
use App\Domains\Customer\Domain\Repositories\CustomerRepositoryInterface;
use App\Domains\Customer\Domain\Models\CustomerVehicle;
use Illuminate\Support\Facades\Log;

class CustomerController extends Controller
{
    public function __construct(
        protected CustomerRepositoryInterface $customerRepo,
        protected CreateCustomer $createCustomer,
        protected UpdateCustomer $updateCustomer,
        protected DeleteCustomer $deleteCustomer
    ) {}

    public function index()
    {
        $customers = $this->customerRepo->getAll();
        return response()->json([
            'status' => 'success',
            'data' => $customers
        ]);
    }

    public function show($id)
    {
        $customer = $this->customerRepo->findById((int)$id);
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
        $dto = CustomerDTO::fromRequest($request);

        try {
            $customer = $this->createCustomer->execute($dto);

            return response()->json([
                'status' => 'success',
                'message' => 'Customer created successfully',
                'data' => $customer
            ]);
        } catch (\Exception $e) {
            Log::error('Customer creation failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create customer: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $dto = CustomerDTO::fromRequest($request);

        try {
            $customer = $this->updateCustomer->execute((int)$id, $dto);

            return response()->json([
                'status' => 'success',
                'message' => 'Customer updated successfully',
                'data' => $customer
            ]);
        } catch (\Exception $e) {
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
            $this->deleteCustomer->execute((int)$id);

            return response()->json([
                'status' => 'success',
                'message' => 'Customer removed successfully'
            ]);
        } catch (\Exception $e) {
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
