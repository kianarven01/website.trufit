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

        $preferredSupplier = $product->resolvePreferredSupplier();

        $preferredPrice = $preferredSupplier?->price;
        $preferredSellingPrice = $preferredPrice?->Price;

        // Fallback: read from Inventory.sell_price when no suppliers
        if ($preferredSellingPrice === null) {
            $inventory = $product->inventoryRows->first();
            $preferredSellingPrice = $inventory?->sell_price;
        }

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

            'preferred_supplier_id' => $preferredSupplier?->id,
            'preferred_supplier' => $preferredSupplier?->supplier ? [
                'id' => $preferredSupplier->supplier->id,
                'CompanyName' => $preferredSupplier->supplier->CompanyName,
                'name' => $preferredSupplier->supplier->CompanyName,
                'supplier_code' => $preferredSupplier->supplier->supplier_code,
            ] : null,
            'preferred_selling_price' => $preferredSellingPrice,

            'suppliers' => $productSuppliers
                ->map(fn ($productSupplier) => [
                    'id' => $productSupplier->id,
                    'supplier_id' => $productSupplier->supplier_id,
                    'supplier_cost' => $productSupplier->supplier_cost,
                    'is_vat' => $productSupplier->is_vat,
                    'vat_percent' => $productSupplier->vat_percent,
                    'is_preferred' => $preferredSupplier && $preferredSupplier->id === $productSupplier->id,
                    'stock_quantity' => $productSupplier->inventory
                        ? (int) $productSupplier->inventory->quantity_on_hand
                        : 0,
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
                ->sortBy(fn ($s) => $s['is_preferred'] ? 0 : 1)
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

        $product->vehicleCompatibilities->loadMissing('vehicleVariant.vehicleModel.manufacturer');

        return $product->vehicleCompatibilities
            ->map(function ($compatibility) {
                $variant = $compatibility->vehicleVariant;

                return [
                    'id' => $compatibility->id,
                    'product_id' => $compatibility->product_id,
                    'car_variant_id' => $compatibility->car_variant_id,
                    'notes' => $compatibility->notes,
                    'vehicle_variant' => $variant ? [
                        'id' => $variant->id,
                        'variant_name' => $variant->variant_name,
                        'variant' => $variant->variant_name,
                        'year' => $variant->year,
                        'model' => $variant->vehicleModel?->model,
                        'make' => $variant->vehicleModel?->manufacturer?->name,
                        'vehicle_model' => $variant->vehicleModel ? [
                            'id' => $variant->vehicleModel->id,
                            'model' => $variant->vehicleModel->model,
                            'make' => $variant->vehicleModel->manufacturer?->name,
                        ] : null,
                    ] : null,
                    'name' => $variant?->variant_name,
                ];
            })
            ->values()
            ->all();
    }
}
