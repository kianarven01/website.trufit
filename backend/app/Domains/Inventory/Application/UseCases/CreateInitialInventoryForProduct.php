<?php

namespace App\Domains\Inventory\Application\UseCases;

use App\Domains\Inventory\Domain\Models\Inventory;

class CreateInitialInventoryForProduct
{
    public function execute(string $productId): Inventory
    {
        return Inventory::create([
            'productID' => $productId,
            'quantity_on_hand' => 0,
            'sell_price' => null,
            'location_id' => 'd3b07384-d113-4ec6-a55d-752007414777',
            'reserved_quantity' => 0,
            'reorder_level' => 5,
            'reorder_qty' => 10,
        ]);
    }
}