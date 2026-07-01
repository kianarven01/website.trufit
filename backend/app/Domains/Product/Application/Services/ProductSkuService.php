<?php

namespace App\Domains\Product\Application\Services;

use App\Domains\Product\Domain\Models\Manufacturers;
use App\Domains\Product\Domain\Models\Part;
use App\Domains\Product\Domain\Models\Product;

class ProductSkuService
{
    public function generate(int $manufacturerId, int $partId): string
    {
        $manufacturer = Manufacturers::query()->findOrFail($manufacturerId);
        $part = Part::query()->findOrFail($partId);

        $manufacturerCode = $this->normalize($manufacturer->code ?: $manufacturer->name, 3);
        $partCode = $this->normalize($part->code ?: $part->name, 4);
        $prefix = "{$manufacturerCode}-{$partCode}";

        $existingSkus = Product::query()
            ->where('SKU', 'like', "{$prefix}-%")
            ->pluck('SKU');

        $maxSequence = 0;

        foreach ($existingSkus as $sku) {
            if (preg_match('/^' . preg_quote($prefix, '/') . '-(\d+)$/i', $sku, $matches)) {
                $maxSequence = max($maxSequence, (int) $matches[1]);
            }
        }

        return sprintf('%s-%03d', $prefix, $maxSequence + 1);
    }

    private function normalize(?string $value, int $fallbackLength = 3): string
    {
        $value = trim((string) $value);

        if ($value === '') {
            return 'GEN';
        }

        $words = preg_split('/[\s\-_]+/', strtoupper($value));

        if (count($words) > 1) {
            $code = collect($words)
                ->filter()
                ->map(fn ($word) => substr($word, 0, 1))
                ->join('');
        } else {
            $code = strtoupper(substr($value, 0, $fallbackLength));
        }

        $code = preg_replace('/[^A-Z0-9]/', '', $code);

        return $code ?: 'GEN';
    }
}
