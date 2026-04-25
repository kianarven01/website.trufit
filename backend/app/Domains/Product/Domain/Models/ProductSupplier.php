<?php

namespace App\Domains\Product\Domain\Models;

use App\Domains\Supplier\Domain\Models\Supplier;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ProductSupplier extends Model
{
    use HasUuids;

    protected $table = 'Main.ProductSuppliers';

    public $timestamps = false;

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'product_id',
        'supplier_id',
        'supplier_cost',
    ];

    protected $casts = [
        'supplier_cost' => 'decimal:2',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class, 'supplier_id', 'id');
    }
}