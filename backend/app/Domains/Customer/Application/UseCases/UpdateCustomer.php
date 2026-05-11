<?php

namespace App\Domains\Customer\Application\UseCases;

use App\Domains\Customer\Application\DTOs\CustomerDTO;
use App\Domains\Customer\Domain\Models\CustomerVehicle;
use App\Domains\Customer\Domain\Repositories\CustomerRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Exception;

class UpdateCustomer
{
    public function __construct(
        protected CustomerRepositoryInterface $customerRepo
    ) {}

    public function execute(int $id, CustomerDTO $dto)
    {
        return DB::transaction(function () use ($id, $dto) {
            $customer = $this->customerRepo->findById($id);
            if (!$customer) throw new Exception("Customer not found");

            // Upgrade origin to 'manual' when a human edits the customer
            if ($customer->origin !== 'manual') {
                $customer->update(['origin' => 'manual']);
            }

            // Check if any NEW plate already belongs to another customer
            foreach ($dto->vehicles as $v) {
                $plate = $v['plateNo'] ?? $v['plate_number'] ?? '';
                $oldPlate = $v['oldPlateNo'] ?? $v['old_plate_number'] ?? null;
                $existing = CustomerVehicle::where('plate_number', $plate)->first();
                if ($existing && $existing->customerID != $customer->customer_id) {
                    throw new Exception("Plate number {$plate} is already registered to another customer.");
                }

                // If plate was changed, check if the old vehicle is safe to update
                if ($oldPlate && $oldPlate !== $plate) {
                    $oldVehicle = CustomerVehicle::where('plate_number', $oldPlate)
                        ->where('customerID', $customer->customer_id)
                        ->first();

                    if ($oldVehicle && !$this->isVehicleSafeToUpdate($oldVehicle->id)) {
                        throw new Exception("Plate number {$oldPlate} has service history and cannot be changed. Add a new vehicle instead.");
                    }
                }
            }

            $this->customerRepo->update($id, [
                'first_name' => $dto->first_name,
                'last_name' => $dto->last_name,
                'mobile_number' => $dto->mobile_number,
                'address' => $dto->address,
                'landline' => $dto->landline,
                'email' => $dto->email,
                'business' => $dto->business,
            ]);

            // Collect old plates before sync to detect changes
            $oldVehicles = CustomerVehicle::where('customerID', $customer->customer_id)->get();
            $oldPlateMap = $oldVehicles->keyBy('plate_number');

            $this->customerRepo->syncVehicles($customer, $dto->vehicles);

            // After sync, cascade plate number changes to linked appointments
            $this->cascadePlateChangesToAppointments($customer->customer_id, $oldPlateMap, $dto->vehicles);

            return $customer->load('vehicles');
        });
    }

    /**
     * When a plate number is changed on the customer side, update the denormalized
     * plate_number on any linked appointments (only for "for approval" appointments).
     */
    private function cascadePlateChangesToAppointments(int $customerId, $oldPlateMap, array $newVehicles)
    {
        foreach ($newVehicles as $v) {
            $newPlate = $v['plateNo'] ?? $v['plate_number'] ?? '';
            $oldPlate = $v['oldPlateNo'] ?? $v['old_plate_number'] ?? null;

            if (!$oldPlate || $oldPlate === $newPlate || !$newPlate) continue;

            // Find the new vehicle record to get its ID
            $newVehicle = CustomerVehicle::where('plate_number', $newPlate)->first();
            if (!$newVehicle) continue;

            // Update appointments that referenced the old plate for this customer
            DB::table('Main.Appointments')
                ->where('customer_id', $customerId)
                ->where(function ($q) use ($oldPlate, $newVehicle) {
                    $q->where('plate_number', $oldPlate)
                      ->orWhere('vehicle_id', $newVehicle->id);
                })
                ->update(['plate_number' => $newPlate]);
        }
    }

    /**
     * Check if a vehicle can be safely modified (plate change, etc.)
     * A vehicle is safe if it has no history in JobOrders, Warranties, Estimates, or other appointments.
     */
    private function isVehicleSafeToUpdate(int $vehicleId): bool
    {
        // 1. Check for appointments
        $hasAppointments = DB::table('Main.Appointments')
            ->where('vehicle_id', $vehicleId)
            ->exists();
        if ($hasAppointments) return false;

        // 2. Check for Job Orders
        $hasJobOrders = DB::table('Main.JobOrder')
            ->where('vehicle_id_new', $vehicleId)
            ->exists();
        if ($hasJobOrders) return false;

        // 3. Check for Warranties
        $hasWarranties = DB::table('Main.Warranties')
            ->where('vehicle_id_new', $vehicleId)
            ->exists();
        if ($hasWarranties) return false;

        // 4. Check for Estimates
        $hasEstimates = DB::table('Main.Estimates')
            ->where('vehicle_id', $vehicleId)
            ->exists();
        if ($hasEstimates) return false;

        return true;
    }
}
