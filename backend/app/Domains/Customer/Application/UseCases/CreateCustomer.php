<?php

namespace App\Domains\Customer\Application\UseCases;

use App\Domains\Customer\Application\DTOs\CustomerDTO;
use App\Domains\Customer\Domain\Models\CustomerVehicle;
use App\Domains\Customer\Domain\Repositories\CustomerRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Exception;

class CreateCustomer
{
    public function __construct(
        protected CustomerRepositoryInterface $customerRepo
    ) {}

    public function execute(CustomerDTO $dto)
    {
        return DB::transaction(function () use ($dto) {
            // Check if any plate already belongs to another customer
            foreach ($dto->vehicles as $v) {
                $plate = $v['plateNo'] ?? '';
                if (CustomerVehicle::where('plate_number', $plate)->exists()) {
                    throw new Exception("Plate number {$plate} is already registered to another customer.");
                }
            }

            $customer = $this->customerRepo->create([
                'first_name' => $dto->first_name,
                'last_name' => $dto->last_name,
                'mobile_number' => $dto->mobile_number,
                'address' => $dto->address,
                'landline' => $dto->landline,
                'email' => $dto->email,
                'business' => $dto->business,
            ]);

            if (!empty($dto->vehicles)) {
                $this->customerRepo->syncVehicles($customer, $dto->vehicles);
            }

            return $customer->load('vehicles');
        });
    }
}
