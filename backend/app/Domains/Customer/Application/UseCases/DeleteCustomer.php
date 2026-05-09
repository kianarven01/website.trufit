<?php

namespace App\Domains\Customer\Application\UseCases;

use App\Domains\Customer\Domain\Models\CustomerVehicle;
use App\Domains\Customer\Domain\Repositories\CustomerRepositoryInterface;
use Illuminate\Support\Facades\DB;

class DeleteCustomer
{
    public function __construct(
        protected CustomerRepositoryInterface $customerRepo
    ) {}

    public function execute(int $id)
    {
        return DB::transaction(function () use ($id) {
            // Delete associated vehicles first (FK constraint)
            CustomerVehicle::where('customerID', $id)->delete();
            return $this->customerRepo->delete($id);
        });
    }
}
