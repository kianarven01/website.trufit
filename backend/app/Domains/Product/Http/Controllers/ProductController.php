<?php

namespace App\Domains\Product\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Domains\Product\Domain\Models\Product;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with([
            'category',
            'unit',
            'supplier'
        ])->get();

        return response()->json([
            'data' => $products
        ]);
    }
}