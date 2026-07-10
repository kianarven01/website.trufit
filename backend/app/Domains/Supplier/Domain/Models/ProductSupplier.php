<?php

namespace App\Domains\Supplier\Domain\Models;

use App\Domains\Product\Domain\Models\Product;
use App\Domains\Product\Domain\Models\ProductPrice;
use App\Domains\Inventory\Domain\Models\Inventory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ProductSupplier extends Model
{
    use HasUuids;

    protected $table = 'ProductSuppliers';

    public $timestamps = false;

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

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

    public function price()
    {
        return $this->hasOne(ProductPrice::class, 'product_supplier_id', 'id');
    }

    public function inventory()
    {
        return $this->hasOne(Inventory::class, 'product_supplier_id', 'id');
    }
}