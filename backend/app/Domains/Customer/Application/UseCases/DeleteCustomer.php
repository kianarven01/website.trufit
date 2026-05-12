<?php

namespace App\Domains\Customer\Application\UseCases;

use App\Domains\Customer\Domain\Models\CustomerVehicle;
use App\Domains\Customer\Domain\Repositories\CustomerRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Exception;

class DeleteCustomer
{
    public function __construct(
        protected CustomerRepositoryInterface $customerRepo
    ) {}

    public function execute(int $id)
    {
        return DB::transaction(function () use ($id) {
            $customer = $this->customerRepo->findById($id);
            if (!$customer) throw new Exception("Customer not found");

            // ── Tier 1: Block if customer has Sales Orders (service history) ──
            $hasSalesOrders = DB::table('Main.SalesOrder')
                ->where('customerID', $id)
                ->exists();

            if ($hasSalesOrders) {
                throw new Exception("This customer has service history and cannot be removed.");
            }

            // ── Tier 2: Block if customer has Billing Statements ──
            $hasBilling = DB::table('Main.BillingStatement')
                ->where('CustomerID', $id)
                ->exists();

            if ($hasBilling) {
                throw new Exception("This customer has billing records and cannot be removed.");
            }

            // ── Tier 3: Block if customer has active (non-cancelled) appointments ──
            $hasActiveAppointments = DB::table('Main.Appointments')
                ->where('customer_id', $id)
                ->where('status', '!=', 'cancelled')
                ->exists();

            if ($hasActiveAppointments) {
                throw new Exception("This customer has active appointments. Cancel them first before removing the customer.");
            }

            // ── Tier 4: Check vehicles for history ──
            $vehicleIds = CustomerVehicle::where('customerID', $id)->pluck('id');

            foreach ($vehicleIds as $vehicleId) {
                if (!$this->isVehicleSafeToDelete($vehicleId)) {
                    throw new Exception("This customer has vehicles with service history (job orders, warranties, or estimates) and cannot be removed.");
                }
            }

            // ── Safe to delete: unlink appointments → delete vehicles → delete customer ──

            // Unlink any remaining appointments (cancelled ones) to avoid FK violation
            DB::table('Main.Appointments')
                ->where('customer_id', $id)
                ->update([
                    'customer_id' => null,
                    'vehicle_id' => null,
                ]);

            // Delete associated vehicles
            CustomerVehicle::where('customerID', $id)->delete();

            // Delete the customer
            return $this->customerRepo->delete($id);
        });
    }

    /**
     * Check if a vehicle can be safely deleted.
     * A vehicle is safe if it has no references in JobOrder, Warranties, Estimates.
     */
    private function isVehicleSafeToDelete(int $vehicleId): bool
    {
        $hasJobOrders = DB::table('Main.JobOrder')
            ->where('vehicle_id_new', $vehicleId)
            ->exists();
        if ($hasJobOrders) return false;

        $hasWarranties = DB::table('Main.Warranties')
            ->where('vehicle_id_new', $vehicleId)
            ->exists();
        if ($hasWarranties) return false;

        $hasEstimates = DB::table('Main.Estimates')
            ->where('vehicle_id', $vehicleId)
            ->exists();
        if ($hasEstimates) return false;

        return true;
    }
}
