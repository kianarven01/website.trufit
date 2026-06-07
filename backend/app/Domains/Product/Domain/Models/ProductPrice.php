<?php

namespace App\Domains\Product\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use App\Domains\Product\Domain\Models\Product;
use App\Domains\Supplier\Domain\Models\ProductSupplier;
use App\Domains\Supplier\Domain\Models\Supplier;

class ProductPrice extends Model
{
    protected $table = 'Main.ProductPrice';

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'product_supplier_id',
        'Price',
        'Markup',
    ];

    protected $casts = [
        'Price' => 'decimal:2',
        'Markup' => 'decimal:2',
    ];



    public function productSupplier()
    {
        return $this->belongsTo(ProductSupplier::class, 'product_supplier_id', 'id');
    }

}