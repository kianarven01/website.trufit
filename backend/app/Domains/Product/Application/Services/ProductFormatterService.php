<?php

namespace App\Domains\Product\Application\Services;

use App\Domains\Product\Domain\Models\Product;

class ProductFormatterService
{
    public function format(
        Product $product,
        string $fitmentType = 'unfiltered',
        ?string $equivalentToProductId = null,
        ?string $equivalentToProductName = null,
        ?string $equivalenceNotes = null
    ): array {
        $productSuppliers = $product->relationLoaded('productSuppliers')
            ? $product->productSuppliers
            : collect();

        $firstProductSupplier = $productSuppliers->first();

        $inventoryRows = $product->relationLoaded('inventoryRows')
            ? $product->inventoryRows
            : collect();

        $inventoryRelation = $product->relationLoaded('inventoryRelation')
            ? $product->inventoryRelation
            : null;

        $totalStock = $inventoryRows->isNotEmpty()
            ? $inventoryRows->sum(fn ($inventory) => (int) $inventory->quantity_on_hand)
            : (int) ($inventoryRelation?->quantity_on_hand ?? 0);

        $totalReserved = $inventoryRows->isNotEmpty()
            ? $inventoryRows->sum(fn ($inventory) => (int) $inventory->reserved_quantity)
            : (int) ($inventoryRelation?->reserved_quantity ?? 0);

        $availableStock = max($totalStock - $totalReserved, 0);
        $maxReorderLevel = $inventoryRows->isNotEmpty()
            ? (int) ($inventoryRows->max('reorder_level') ?? 0)
            : (int) ($inventoryRelation?->reorder_level ?? 0);

        $stockStatus = match (true) {
            $availableStock <= 0 => 'Out of Stock',
            $maxReorderLevel > 0 && $availableStock <= $maxReorderLevel => 'Low Stock',
            default => 'In Stock',
        };

        return [
            'id' => $product->id,
            'name' => $product->name,
            'SKU' => $product->SKU,
            'sku' => $product->SKU,
            'description' => $product->description,
            'image_URL' => $product->image_path,
            'image_path' => $product->image_path,
            'barcode' => $product->barcode,
            'part_number' => $product->part_number,

            'part_id' => $product->part_id,
            'part' => $product->part?->name,
            'part_name' => $product->part?->name,
            'part_description' => $product->part?->description,

            'category_id' => $product->category_id,
            'category' => $product->category?->name,
            'category_name' => $product->category?->name,

            'unit' => $product->unit,
            'unit_name' => $product->unitRelation?->name,
            'unit_abbreviation' => $product->unitRelation?->abbreviation,

            'manufacturer_id' => $product->manufacturer_id,
            'manufacturer' => $product->manufacturer?->name,
            'manufacturer_name' => $product->manufacturer?->name,

            'supplier_name' => $firstProductSupplier?->supplier?->CompanyName,
            'supplier_code' => $firstProductSupplier?->supplier?->supplier_code,
            'cost' => $firstProductSupplier?->supplier_cost,

            'quantity_on_hand' => $totalStock,
            'reserved_quantity' => $totalReserved,
            'available_quantity' => $availableStock,
            'reorder_level' => $maxReorderLevel,
            'reorder_qty' => $inventoryRelation?->reorder_qty,
            'location_id' => $inventoryRelation?->location_id,
            'sell_price' => $inventoryRelation?->sell_price,
            'stock_status' => $stockStatus,

            'suppliers' => $productSuppliers
                ->map(fn ($productSupplier) => [
                    'id' => $productSupplier->id,
                    'supplier_id' => $productSupplier->supplier_id,
                    'supplier_cost' => $productSupplier->supplier_cost,
                    'is_vat' => $productSupplier->is_vat,
                    'vat_percent' => $productSupplier->vat_percent,
                    'supplier' => $productSupplier->supplier ? [
                        'id' => $productSupplier->supplier->id,
                        'CompanyName' => $productSupplier->supplier->CompanyName,
                        'name' => $productSupplier->supplier->CompanyName,
                        'supplier_code' => $productSupplier->supplier->supplier_code,
                    ] : null,
                    'active_price' => $productSupplier->price ? [
                        'id' => $productSupplier->price->id,
                        'product_supplier_id' => $productSupplier->price->product_supplier_id,
                        'Price' => $productSupplier->price->Price,
                        'Markup' => $productSupplier->price->Markup,
                    ] : null,
                ])
                ->values(),

            'inventory_rows' => $inventoryRows
                ->map(fn ($inventory) => [
                    'id' => $inventory->id,
                    'product_supplier_id' => $inventory->product_supplier_id,
                    'quantity_on_hand' => $inventory->quantity_on_hand,
                    'reserved_quantity' => $inventory->reserved_quantity,
                    'reorder_level' => $inventory->reorder_level,
                    'reorder_qty' => $inventory->reorder_qty,
                    'location_id' => $inventory->location_id,
                ])
                ->values(),

            'vehicle_compatibilities' => $this->formatVehicleCompatibilities($product),
            'compatible_vehicles' => $this->formatVehicleCompatibilities($product),

            'is_oem' => $product->is_oem,
            'oem_reference_number' => $product->oem_reference_number,

            'fitment_type' => $fitmentType,
            'equivalent_to_product_id' => $equivalentToProductId,
            'equivalent_to_product_name' => $equivalentToProductName,
            'equivalence_notes' => $equivalenceNotes,
        ];
    }

    private function formatVehicleCompatibilities(Product $product): array
    {
        if (!$product->relationLoaded('vehicleCompatibilities')) {
            return [];
        }

        return $product->vehicleCompatibilities
            ->map(function ($compatibility) {
                $variant = $compatibility->vehicleVariant;

                return [
                    'id' => $compatibility->id,
                    'product_id' => $compatibility->product_id,
                    'car_variant_id' => $compatibility->car_variant_id,
                    'notes' => $compatibility->notes,
                    'vehicle_variant' => $variant,
                    'name' => $variant?->name
                        ?? $variant?->variant_name
                        ?? $variant?->model_name
                        ?? $variant?->variant
                        ?? null,
                ];
            })
            ->values()
            ->all();
    }
}
