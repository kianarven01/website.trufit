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
        return response()->json($getCategories->execute());
    }

    public function units()
    {
        return response()->json([
            'data' => Unit::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function manufacturers()
    {
        return response()->json([
            'data' => Manufacturers::select('id', 'name')->orderBy('name')->get(),
        ]);
    }
}