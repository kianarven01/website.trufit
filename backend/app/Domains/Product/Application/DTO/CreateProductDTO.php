<?php

namespace App\Domains\Product\Application\DTO;

class CreateProductDTO
{
    public function __construct(
        public readonly array $productData,
        public readonly array $productSuppliers,
        public readonly ?array $compatibility,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            productData: self::extractProductData($data),
            productSuppliers: self::extractProductSuppliers($data),
            compatibility: self::extractCompatibility($data),
        );
    }

    private static function extractProductData(array $data): array
    {
        return [
            'name' => $data['name'],
            'SKU' => $data['SKU'] ?? $data['sku'] ?? null,
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
    }

    private static function extractProductSuppliers(array $data): array
    {
        if (empty($data['suppliers']) || !is_array($data['suppliers'])) {
            return [];
        }

        return collect($data['suppliers'])
            ->filter(fn($row) => !empty($row['supplier_id']))
            ->map(function ($row) {
                return [
                    'supplier_id' => $row['supplier_id'],
                    'supplier_cost' => isset($row['supplier_cost'])
                        ? (float) $row['supplier_cost']
                        : null,
                    'is_vat' => filter_var($row['is_vat'] ?? false, FILTER_VALIDATE_BOOLEAN),
                    'vat_percent' => isset($row['vat_percent'])
                        ? (float) $row['vat_percent']
                        : null,
                ];
            })
            ->values()
            ->toArray();
    }

    private static function extractCompatibility(array $data): ?array
    {
        if (empty($data['car_variant_id'])) {
            return null;
        }

        return [
            'car_variant_id' => (int) $data['car_variant_id'],
            'notes' => $data['compatibility_notes'] ?? null,
        ];
    }
}
