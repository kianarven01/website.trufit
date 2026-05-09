<?php

namespace App\Domains\Customer\Domain\Repositories;

use App\Domains\Customer\Domain\Models\Customer;

interface CustomerRepositoryInterface
{
    public function getAll();
    public function findById(int $id): ?Customer;
    public function create(array $data): Customer;
    public function update(int $id, array $data): Customer;
    public function delete(int $id): bool;
    public function syncVehicles(Customer $customer, array $vehicles);
}
