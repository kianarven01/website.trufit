<?php

namespace App\Domains\Product\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Product\Application\UseCases\GetCategories;
use App\Domains\Product\Domain\Models\Unit;
use App\Domains\Product\Domain\Models\Manufacturers;

class ProductReferenceController extends Controller
{
    public function categories(GetCategories $getCategories)
    {
        $categories = $getCategories->execute();

        return response()->json($categories);
    }

    public function units()
    {
        $units = Unit::select('id', 'name')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $units,
        ]);
    }

    public function manufacturers()
    {
        $manufacturers = Manufacturers::select('id', 'name')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $manufacturers,
        ]);
    }
}