<?php

namespace App\Domains\Purchasing\Domain\Repositories;

use App\Domains\Purchasing\Domain\Models\GoodsReceipt;

interface GoodsReceiptRepositoryInterface
{
    public function findById(string $id): ?GoodsReceipt;

    public function create(array $data): GoodsReceipt;
}
