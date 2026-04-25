<?php

namespace App\Domains\Product\Application\DTO;

class CreateProductDTO
{
    public function __construct(
        public readonly array $productData,
        public readonly array $suppliers = [],
        public readonly ?array $compatibility = null,
    ) {}

    public static function fromArray(array $data): self
    {
        $suppliers = $data['suppliers'] ?? [];

        $compatibility = null;

        if (!empty($data['car_variant_id'])) {
            $compatibility = [
                'car_variant_id' => (int) $data['car_variant_id'],
                'notes' => $data['compatibility_notes'] ?? null,
            ];
        }

        $productData = [
            'name' => $data['name'],
            'SKU' => $data['SKU'] ?? $data['sku'] ?? null,
            'cost' => isset($data['cost']) ? (float) $data['cost'] : 0,
            'part_number' => $data['part_number'] ?? null,
            'description' => $data['description'] ?? null,
            'image_path' => $data['image_path'] ?? null,
            'category_id' => $data['category_id'] ?? null,
            'unit' => $data['unit'] ?? null,
            'manufacturer_id' => $data['manufacturer_id'] ?? null,
            'barcode' => $data['barcode'] ?? null,
            'part_id' => $data['part_id'] ?? null,
            'is_oem' => filter_var($data['is_oem'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'oem_reference_number' => $data['oem_reference_number'] ?? null,
        ];

        return new self(
            productData: $productData,
            suppliers: $suppliers,
            compatibility: $compatibility,
        );
    }
}