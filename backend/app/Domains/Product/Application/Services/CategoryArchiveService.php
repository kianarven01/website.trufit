<?php

namespace App\Domains\Product\Application\Services;

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

        if ($productsCount > 0 || $partsCount > 0) {
            abort(409, "Cannot delete category. It is assigned to {$productsCount} product(s) and {$partsCount} part(s). Reassign or remove them first.");
        }

        $category->delete();

        return [
            'category_id' => $category->id,
            'category_name' => $category->name,
        ];
    }
}