<?php

namespace App\Domains\Product\Application\Services;

use App\Domains\Product\Application\DTO\UpdateProductDTO;
use App\Domains\Product\Domain\Models\Category;
use App\Domains\Product\Domain\Models\Manufacturers;
use App\Domains\Product\Domain\Models\Part;
use App\Domains\Product\Domain\Models\Product;
use App\Domains\Product\Domain\Models\Unit;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ProductUpdateService
{
    public function __construct(
        private readonly ProductSkuService $skuService,
    ) {
    }

    public function update(UpdateProductDTO $dto): Product
    {
        return DB::transaction(function () use ($dto) {
            $product = Product::withTrashed()
                ->where('id', $dto->productId)
                ->lockForUpdate()
                ->first();

            if (!$product) {
                throw new RuntimeException('Product not found.', 404);
            }

            if ($product->trashed()) {
                throw new RuntimeException('Archived products cannot be edited.', 409);
            }

            $data = $this->normalizeNullableStrings($dto->data);

            $this->validatePartAndCategory($product, $data);
            $this->validateManufacturer($data);
            $this->validateUnit($data);
            $this->prepareSkuAndBarcode($product, $data);
            $this->validateBarcodeIsUnique($product, $data);

            $updateData = array_intersect_key($data, array_flip([
                'name',
                'SKU',
                'description',
                'image_path',
                'category_id',
                'barcode',
                'part_number',
                'is_oem',
                'oem_reference_number',
                'unit',
                'part_id',
                'manufacturer_id',
            ]));

            $product->fill($updateData);
            $product->save();

            return $product->refresh();
        });
    }

    private function normalizeNullableStrings(array $data): array
    {
        foreach ([
            'SKU',
            'description',
            'image_path',
            'barcode',
            'part_number',
            'oem_reference_number',
        ] as $field) {
            if (array_key_exists($field, $data) && $data[$field] === '') {
                $data[$field] = null;
            }
        }

        return $data;
    }

    private function validatePartAndCategory(Product $product, array &$data): void
    {
        if (array_key_exists('part_id', $data) && $data['part_id'] !== null) {
            $part = Part::query()
                ->where('id', (int) $data['part_id'])
                ->first();

            if (!$part) {
                throw new RuntimeException('The selected part does not exist.', 422);
            }

            // Keep the same rule as add product: selected part controls the category.
            $data['category_id'] = $part->category_id;
            return;
        }

        if (array_key_exists('category_id', $data) && $data['category_id'] !== null) {
            $categoryExists = Category::query()
                ->where('id', (int) $data['category_id'])
                ->exists();

            if (!$categoryExists) {
                throw new RuntimeException('The selected category does not exist.', 422);
            }
        }
    }

    private function validateManufacturer(array $data): void
    {
        if (!array_key_exists('manufacturer_id', $data) || $data['manufacturer_id'] === null) {
            return;
        }

        $manufacturerExists = Manufacturers::query()
            ->where('id', (int) $data['manufacturer_id'])
            ->exists();

        if (!$manufacturerExists) {
            throw new RuntimeException('The selected manufacturer does not exist.', 422);
        }
    }

    private function validateUnit(array $data): void
    {
        if (!array_key_exists('unit', $data) || $data['unit'] === null) {
            return;
        }

        $unitExists = Unit::query()
            ->where('id', (int) $data['unit'])
            ->exists();

        if (!$unitExists) {
            throw new RuntimeException('The selected unit does not exist.', 422);
        }
    }

    private function prepareSkuAndBarcode(Product $product, array &$data): void
    {
        $manufacturerId = array_key_exists('manufacturer_id', $data)
            ? $data['manufacturer_id']
            : $product->manufacturer_id;

        $partId = array_key_exists('part_id', $data)
            ? $data['part_id']
            : $product->part_id;

        $shouldGenerateSku = (bool) ($data['auto_generate_sku'] ?? false)
            || (array_key_exists('SKU', $data) && empty($data['SKU']));

        if ($shouldGenerateSku && !empty($manufacturerId) && !empty($partId)) {
            $data['SKU'] = $this->skuService->generate((int) $manufacturerId, (int) $partId);
        }

        if (array_key_exists('barcode', $data) && empty($data['barcode']) && !empty($data['SKU'])) {
            $data['barcode'] = $data['SKU'];
        }
    }

    private function validateBarcodeIsUnique(Product $product, array $data): void
    {
        if (!array_key_exists('barcode', $data) || empty($data['barcode'])) {
            return;
        }

        $barcodeExists = Product::query()
            ->where('barcode', $data['barcode'])
            ->where('id', '!=', $product->id)
            ->exists();

        if ($barcodeExists) {
            throw new RuntimeException('The barcode has already been taken.', 422);
        }
    }
}
