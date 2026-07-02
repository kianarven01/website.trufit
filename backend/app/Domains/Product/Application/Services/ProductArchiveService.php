<?php

namespace App\Domains\Product\Application\Services;

use App\Domains\Inventory\Domain\Models\Inventory;
use App\Domains\Product\Domain\Models\Product;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ProductArchiveService
{
    public function archive(string $productId): array
    {
        return DB::transaction(function () use ($productId) {
            $product = Product::withTrashed()
                ->where('id', $productId)
                ->lockForUpdate()
                ->first();

            if (!$product) {
                throw new RuntimeException('Product not found.', 404);
            }

            if ($product->trashed()) {
                throw new RuntimeException('Product is already archived.', 409);
            }

            $stockSummary = Inventory::query()
                ->where('productID', $productId)
                ->selectRaw('COALESCE(SUM(quantity_on_hand), 0) as quantity_on_hand')
                ->selectRaw('COALESCE(SUM(reserved_quantity), 0) as reserved_quantity')
                ->first();

            $quantityOnHand = (int) ($stockSummary->quantity_on_hand ?? 0);
            $reservedQuantity = (int) ($stockSummary->reserved_quantity ?? 0);

            if ($quantityOnHand > 0 || $reservedQuantity > 0) {
                throw new RuntimeException(
                    'Product cannot be archived because it still has stock or reserved quantity.',
                    409
                );
            }

            $product->delete();

            return [
                'id' => $product->id,
                'name' => $product->name,
                'deleted_at' => $product->deleted_at,
            ];
        });
    }
}
