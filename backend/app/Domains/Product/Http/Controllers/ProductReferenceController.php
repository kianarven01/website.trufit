<?php

namespace App\Domains\Product\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Product\Domain\Models\Category;
use App\Domains\Product\Domain\Models\Unit;
use App\Domains\Product\Domain\Models\Supplier;

class ProductReferenceController extends Controller
{
    public function categories()
    {
        return response()->json([
            'data' => Category::select('id','name')->get()
        ]);
    }

    public function units()
    {
        return response()->json([
            'data' => Unit::select('id','name')->get()
        ]);`
    }

    public function suppliers()
    {
        return response()->json([
            'data' => Supplier::select('id','CompanyName')->get()
        ]);
    }
}