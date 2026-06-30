<?php

namespace App\Domains\Purchasing\Domain\Repositories;

use App\Domains\Purchasing\Domain\Models\PurchaseOrder;

interface PurchaseOrderRepositoryInterface
{
    public function findById(string $id): ?PurchaseOrder;

    public function create(array $data): PurchaseOrder;
}
