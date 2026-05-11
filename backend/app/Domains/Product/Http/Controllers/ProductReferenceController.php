<?php

namespace App\Domains\Product\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Product\Domain\Models\Category;
use App\Domains\Product\Domain\Models\Unit;
use App\Domains\Product\Domain\Models\Manufacturers;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductReferenceController extends Controller
{
    public function categories(): JsonResponse
    {
        $categories = Category::query()
            ->select('id', 'name', 'code')
            ->withCount('products')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $categories,
        ]);
    }

    public function storeCategory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50'],
        ]);

        $category = Category::create([
            'name' => $validated['name'],
            'code' => $validated['code'] ?? Str::upper(Str::slug($validated['name'], '_')),
        ]);

        return response()->json([
            'message' => 'Category created successfully.',
            'data' => $category,
        ], 201);
    }

    public function updateCategory(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50'],
        ]);

        $category = Category::query()->where('id', $id)->firstOrFail();

        $category->update([
            'name' => $validated['name'],
            'code' => $validated['code'] ?? $category->code,
        ]);

        return response()->json([
            'message' => 'Category updated successfully.',
            'data' => $category,
        ]);
    }

    public function deleteCategory(string $id): JsonResponse
    {
        $category = Category::query()->where('id', $id)->firstOrFail();

        $category->delete();

        return response()->json([
            'message' => 'Category deleted successfully.',
        ]);
    }

    public function units(): JsonResponse
    {
        $units = Unit::query()
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $units,
        ]);
    }

    public function manufacturers(): JsonResponse
    {
        $manufacturers = Manufacturers::query()
            ->select('id', 'name', 'type')
            ->where('type', 'parts')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $manufacturers,
        ]);
    }
}