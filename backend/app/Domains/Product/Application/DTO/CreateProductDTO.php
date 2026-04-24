<?php

namespace App\Domains\Product\Application\DTO;

class CreateProductDTO
{
    public function __construct(
        public readonly string $name,
        public readonly string $SKU,
        public readonly float $cost,
        public readonly string $partNumber,
        public readonly ?string $description,
        public readonly ?string $imagePath,
        public readonly ?int $categoryId,
        public readonly ?int $unit,
        public readonly ?int $manufacturerId,
        public readonly ?string $barcode,
        public readonly ?int $partId,
        public readonly bool $isOem,
        public readonly ?string $oemReferenceNumber,
        public readonly ?int $carVariantId,
        public readonly ?string $compatibilityNotes,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'],
            SKU: $data['SKU'],
            cost: (float) $data['cost'],
            partNumber: $data['part_number'],
            description: $data['description'] ?? null,
            imagePath: $data['image_path'] ?? null,
            categoryId: isset($data['category_id']) ? (int) $data['category_id'] : null,
            unit: isset($data['unit']) ? (int) $data['unit'] : null,
            manufacturerId: isset($data['manufacturer_id']) ? (int) $data['manufacturer_id'] : null,
            barcode: $data['barcode'] ?? null,
            partId: isset($data['part_id']) ? (int) $data['part_id'] : null,
            isOem: filter_var($data['is_oem'] ?? false, FILTER_VALIDATE_BOOLEAN),
            oemReferenceNumber: $data['oem_reference_number'] ?? null,
            carVariantId: isset($data['car_variant_id']) ? (int) $data['car_variant_id'] : null,
            compatibilityNotes: $data['compatibility_notes'] ?? null,
        );
    }
}