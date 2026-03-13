<?php

namespace App\Domains\Product\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Product\Domain\Models\Category;
use App\Domains\Product\Domain\Models\Unit;

class ProductReferenceController extends Controller
{
    public function categories()
    {
        $categories = Category::select('id', 'name', 'code')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $categories
        ]);
    }

    public function units()
    {
        $units = Unit::select('id', 'name')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $units
        ]);
    }
}