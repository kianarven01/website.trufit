<?php

namespace App\Domains\Purchasing\Infrastructure\Repositories;

use App\Domains\Purchasing\Domain\Models\GoodsReceipt;
use App\Domains\Purchasing\Domain\Repositories\GoodsReceiptRepositoryInterface;

class EloquentGoodsReceiptRepository implements GoodsReceiptRepositoryInterface
{
    public function findById(string $id): ?GoodsReceipt
    {
        return GoodsReceipt::find($id);
    }

    public function create(array $data): GoodsReceipt
    {
        return GoodsReceipt::create($data);
    }
}
