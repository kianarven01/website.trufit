<?php

namespace App\Domains\Supplier\Application\UseCases;

use App\Domains\Supplier\Domain\Models\ProductSupplier;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;

class UnlinkProductFromSupplier
{
    public function execute($supplierId, $productId)
    {
        $link = ProductSupplier::where('supplier_id', $supplierId)
            ->where('product_id', $productId)
            ->first();

        if (!$link) {
            throw new ModelNotFoundException('Relationship not found');
        }

        $hasStock = DB::table('Main.Inventory')
            ->where('product_supplier_id', $link->id)
            ->where(function ($query) {
                $query->where('quantity_on_hand', '>', 0)
                    ->orWhere('reserved_quantity', '>', 0);
            })
            ->exists();

        if ($hasStock) {
            throw new \Exception('Cannot unlink product with active stock or reserved quantity. Adjust stock to 0 first.');
        }

        $inventoryIds = DB::table('Main.Inventory')
            ->where('product_supplier_id', $link->id)
            ->pluck('id');

        DB::table('Main.StockMovements')
            ->whereIn('inventory_id', $inventoryIds)
            ->delete();

        DB::table('Main.Inventory')->where('product_supplier_id', $link->id)->delete();
        DB::table('Main.ProductPrice')->where('product_supplier_id', $link->id)->delete();

        return $link->delete();
    }
}
