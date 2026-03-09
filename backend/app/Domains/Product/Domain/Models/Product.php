<?php

namespace App\Domains\Product\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use App\Domains\Product\Domain\Models\Category;
use App\Domains\Product\Domain\Models\Unit;
use App\Domains\Supplier\Domain\Models\Supplier;

class Product extends Model
{
    protected $table = 'Products';

    protected $fillable = [
        'name',
        'SKU',
        'cost',
        'description',
        'image_URL',
        'barcode',
        'part_number',
        'category_id',
        'unit',
        'supplier_code',
        'quantity_on_hand',
        'sell_price',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class, 'unit', 'id');
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class, 'supplier_code', 'supplier_code');
    }
}