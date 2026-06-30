<?php

namespace App\Domains\Purchasing\Infrastructure\Repositories;

use App\Domains\Purchasing\Domain\Models\PurchaseOrder;
use App\Domains\Purchasing\Domain\Repositories\PurchaseOrderRepositoryInterface;

class EloquentPurchaseOrderRepository implements PurchaseOrderRepositoryInterface
{
    public function findById(string $id): ?PurchaseOrder
    {
        return PurchaseOrder::find($id);
    }

    public function create(array $data): PurchaseOrder
    {
        return PurchaseOrder::create($data);
    }
}
