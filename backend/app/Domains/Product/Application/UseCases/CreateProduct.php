<?php

namespace App\Domains\Product\Application\UseCases;

use App\Domains\Product\Application\DTO\CreateProductDTO;
use App\Domains\Product\Domain\Models\Product;
use App\Domains\Product\Domain\Models\ProductVehicleCompatibility;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CreateProduct
{
    public function execute(CreateProductDTO $dto): Product
    {
        return DB::transaction(function () use ($dto) {
            $product = Product::create([
                'id' => (string) Str::uuid(),
                'name' => $dto->name,
                'SKU' => $dto->SKU,
                'cost' => $dto->cost,
                'description' => $dto->description,
                'image_path' => $dto->imagePath,

                'category_id' => $dto->categoryId,
                'unit' => $dto->unit,
                'manufacturer_id' => $dto->manufacturerId,

                'barcode' => $dto->barcode,
                'part_number' => $dto->partNumber,
                'part_id' => $dto->partId,

                'is_oem' => $dto->isOem,
                'oem_reference_number' => $dto->oemReferenceNumber,
            ]);

            if ($dto->carVariantId) {
                ProductVehicleCompatibility::create([
                    'product_id' => $product->id,
                    'car_variant_id' => $dto->carVariantId,
                    'notes' => $dto->compatibilityNotes,
                    'created_at' => now(),
                ]);
            }

            return $product;
        });
    }
}