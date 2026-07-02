<?php

namespace App\Domains\Product\Application\Services;

use Illuminate\Support\Facades\DB;
use App\Domains\Product\Domain\Models\Category;
use App\Domains\Product\Domain\Models\Product;
use App\Domains\Product\Domain\Models\Part;

class CategoryArchiveService
{
    public function archive(int|string $categoryId): array
    {
        $category = Category::findOrFail($categoryId);

        $productsCount = Product::where('category_id', $category->id)->count();
        $partsCount = Part::where('category_id', $category->id)->count();

        DB::transaction(function () use ($category) {
            Product::where('category_id', $category->id)
                ->update([
                    'category_id' => null,
                ]);

            Part::where('category_id', $category->id)
                ->update([
                    'category_id' => null,
                ]);

            $category->update([
                'is_active' => false,
                'archived_at' => now(),
            ]);
        });

        return [
            'category_id' => $category->id,
            'category_name' => $category->name,
            'unassigned_products_count' => $productsCount,
            'unassigned_parts_count' => $partsCount,
        ];
    }
}