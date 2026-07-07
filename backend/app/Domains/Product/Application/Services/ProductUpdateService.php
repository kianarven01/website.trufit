<?php

namespace App\Domains\Product\Application\Services;

use App\Domains\Product\Application\DTO\UpdateProductDTO;
use App\Domains\Product\Domain\Models\Category;
use App\Domains\Product\Domain\Models\Manufacturers;
use App\Domains\Product\Domain\Models\Part;
use App\Domains\Product\Domain\Models\Product;
use App\Domains\Product\Domain\Models\Unit;
use App\Domains\Inventory\Domain\Models\Inventory;
use App\Domains\Supplier\Domain\Models\ProductSupplier;
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
                'preferred_supplier_id',
            ]));

            $product->fill($updateData);
            $product->save();

            // Handle suppliers update for SPOL products
            if (array_key_exists('suppliers', $data)) {
                $this->updateProductSuppliers($product, $data['suppliers'] ?? []);
            }

            // Handle selling_price update for supplier-less SPOL products
            if (array_key_exists('selling_price', $data)) {
                $this->updateSellingPrice($product, $data['selling_price'] ?? null);
            }

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

    private function updateProductSuppliers(Product $product, array $suppliers): void
    {
        // Remove existing product suppliers
        ProductSupplier::where('product_id', $product->id)->delete();

        // Create new product suppliers
        foreach ($suppliers as $supplier) {
            if (empty($supplier['supplier_id'])) {
                continue;
            }

            $productSupplier = ProductSupplier::create([
                'product_id' => $product->id,
                'supplier_id' => $supplier['supplier_id'],
                'supplier_cost' => $supplier['supplier_cost'] ?? null,
                'is_vat' => $supplier['is_vat'] ?? false,
                'vat_percent' => $supplier['vat_percent'] ?? null,
            ]);

            // Create price record if markup or price provided
            $markup = $supplier['markup'] ?? null;
            $price = $supplier['price'] ?? null;

            if ($price === null && $markup !== null && isset($supplier['supplier_cost'])) {
                $price = (float) $supplier['supplier_cost'] + ((float) $supplier['supplier_cost'] * ((float) $markup / 100));
            }

            if ($price !== null) {
                \App\Domains\Product\Domain\Models\ProductPrice::create([
                    'product_supplier_id' => $productSupplier->id,
                    'supplier_id' => $supplier['supplier_id'],
                    'price' => $price,
                    'markup' => $markup,
                ]);
            }
        }

        // Set preferred supplier to first one if exists
        if (!empty($suppliers)) {
            $firstSupplierId = $suppliers[0]['supplier_id'] ?? null;
            if ($firstSupplierId) {
                $product->update(['preferred_supplier_id' => null]);
                $productSupplier = ProductSupplier::where('product_id', $product->id)
                    ->where('supplier_id', $firstSupplierId)
                    ->first();
                if ($productSupplier) {
                    $product->update(['preferred_supplier_id' => $productSupplier->id]);
                }
            }
        }
    }

    private function updateSellingPrice(Product $product, ?float $sellingPrice): void
    {
        $hasSuppliers = ProductSupplier::where('product_id', $product->id)->exists();

        if ($hasSuppliers) {
            return; // Don't update inventory sell_price when suppliers exist
        }

        // Update or create inventory record for supplier-less products
        $inventory = Inventory::where('product_id', $product->id)
            ->whereNull('product_supplier_id')
            ->first();

        if ($inventory) {
            $inventory->update(['sell_price' => $sellingPrice]);
        } elseif ($sellingPrice !== null) {
            Inventory::create([
                'product_id' => $product->id,
                'product_supplier_id' => null,
                'sell_price' => $sellingPrice,
                'stock_quantity' => 0,
                'reserved_quantity' => 0,
            ]);
        }
    }
}
