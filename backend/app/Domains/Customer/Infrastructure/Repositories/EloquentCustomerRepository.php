<?php

namespace App\Domains\Customer\Infrastructure\Repositories;

use App\Domains\Customer\Domain\Models\Customer;
use App\Domains\Customer\Domain\Models\CustomerVehicle;
use App\Domains\Customer\Domain\Repositories\CustomerRepositoryInterface;
use Illuminate\Support\Facades\DB;

class EloquentCustomerRepository implements CustomerRepositoryInterface
{
    public function getAll()
    {
        return Customer::with('vehicles')->get();
    }

    public function findById(int $id): ?Customer
    {
        return Customer::with('vehicles')->find($id);
    }

    public function create(array $data): Customer
    {
        return Customer::create($data);
    }

    public function update(int $id, array $data): Customer
    {
        $customer = Customer::findOrFail($id);
        $customer->update($data);
        return $customer;
    }

    public function delete(int $id): bool
    {
        $customer = Customer::findOrFail($id);
        return $customer->delete();
    }

    public function syncVehicles(Customer $customer, array $vehicles)
    {
        $processedPlates = [];
        foreach ($vehicles as $vehicleData) {
            $plate = $vehicleData['plateNo'] ?? $vehicleData['plate_number'] ?? '';
            $oldPlate = $vehicleData['oldPlateNo'] ?? $vehicleData['old_plate_number'] ?? null;
            if (!$plate || in_array($plate, $processedPlates)) continue;
            $processedPlates[] = $plate;

            $updateData = [
                'customerID' => $customer->customer_id,
                'engine_number' => $vehicleData['engineNo'] ?? $vehicleData['engine_number'] ?? '',
                'VIN' => $vehicleData['vin'] ?? $vehicleData['VIN'] ?? '',
                'color' => $vehicleData['color'] ?? '',
                'registration_number' => $vehicleData['registrationNo'] ?? $vehicleData['registration_number'] ?? '',
                'year_model' => (string)($vehicleData['year'] ?? $vehicleData['year_model'] ?? ''),
                'make' => $vehicleData['make'] ?? '',
                'model' => $vehicleData['model'] ?? '',
                'variant' => $vehicleData['variant'] ?? '',
                'selling_dealer' => $vehicleData['sellingDealer'] ?? $vehicleData['selling_dealer'] ?? '',
                'vehicle_variant_id' => (!empty($vehicleData['vehicleModelId'])) ? $vehicleData['vehicleModelId'] : null,
            ];

            // If plate was changed, find by old plate and update (including new plate)
            if ($oldPlate && $oldPlate !== $plate) {
                $existingByOldPlate = CustomerVehicle::where('plate_number', $oldPlate)
                    ->where('customerID', $customer->customer_id)
                    ->first();

                if ($existingByOldPlate) {
                    $updateData['plate_number'] = $plate;
                    $existingByOldPlate->update($updateData);
                } else {
                    // Fallback: create or update by new plate
                    CustomerVehicle::updateOrCreate(
                        ['plate_number' => $plate],
                        $updateData
                    );
                }
            } else {
                CustomerVehicle::updateOrCreate(
                    ['plate_number' => $plate],
                    $updateData
                );
            }

            // Sync to Manufacturer/Model Catalog
            $this->syncVehicleCatalog($vehicleData['make'] ?? '', $vehicleData['model'] ?? '');
        }
        
        // Remove vehicles that are no longer in the list for this customer
        $customer->vehicles()->whereNotIn('plate_number', $processedPlates)->delete();
    }

    private function syncVehicleCatalog(string $make, string $model)
    {
        $make = trim($make);
        $model = trim($model);
        if (empty($make) || empty($model)) return;

        // Use case-insensitive lookup to prevent duplicates (Postgres ILIKE)
        $manufacturer = \App\Domains\Product\Domain\Models\Manufacturers::where('name', 'ILIKE', $make)
            ->where('type', 'Vehicle')
            ->first();

        if (!$manufacturer) {
            $manufacturer = \App\Domains\Product\Domain\Models\Manufacturers::create([
                'name' => ucfirst($make), 
                'type' => 'Vehicle'
            ]);
        }

        $vehicleModel = \App\Domains\Product\Domain\Models\VehicleModel::where('model', 'ILIKE', $model)
            ->where('manufacturer_id', $manufacturer->id)
            ->first();

        if (!$vehicleModel) {
            \App\Domains\Product\Domain\Models\VehicleModel::create([
                'model' => ucfirst($model), 
                'manufacturer_id' => $manufacturer->id
            ]);
        }
    }
}
