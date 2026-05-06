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

            // Check if any NEW plate already belongs to another customer
            foreach ($dto->vehicles as $v) {
                $plate = $v['plateNo'] ?? $v['plate_number'] ?? '';
                $existing = CustomerVehicle::where('plate_number', $plate)->first();
                if ($existing && $existing->customerID != $customer->customer_id) {
                    throw new Exception("Plate number {$plate} is already registered to another customer.");
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

            $this->customerRepo->syncVehicles($customer, $dto->vehicles);

            return $customer->load('vehicles');
        });
    }
}
