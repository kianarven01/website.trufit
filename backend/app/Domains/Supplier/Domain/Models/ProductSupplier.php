<?php

namespace App\Domains\Supplier\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use App\Domains\Product\Domain\Models\Product;
use App\Domains\Supplier\Domain\Models\Supplier;
use App\Domains\Product\Domain\Models\ProductPrice;

class ProductSupplier extends Model
{
    protected $table = 'Main.ProductSuppliers';

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'product_id',
        'supplier_id',
        'supplier_cost',
        'is_vat',
        'vat_percent',
    ];

    protected $casts = [
        'supplier_cost' => 'decimal:2',
        'is_vat' => 'boolean',
        'vat_percent' => 'decimal:2',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class, 'supplier_id', 'id');
    }

    public function prices()
    {
        return $this->hasMany(ProductPrice::class, 'product_supplier_id', 'id');
    }

    
}