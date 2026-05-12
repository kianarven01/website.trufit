<?php

namespace App\Domains\Product\Domain\Models;

use Illuminate\Database\Eloquent\Model;

class ProductEquivalent extends Model
{
    protected $table = 'Main.ProductEquivalents';

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'base_product_id',
        'equivalent_product_id',
        'notes',
    ];

    protected $casts = [
        'id' => 'string',
        'base_product_id' => 'string',
        'equivalent_product_id' => 'string',
    ];

    public function baseProduct()
    {
        return $this->belongsTo(Product::class, 'base_product_id', 'id');
    }

    public function equivalentProduct()
    {
        return $this->belongsTo(Product::class, 'equivalent_product_id', 'id');
    }
}