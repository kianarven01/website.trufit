<?php

namespace App\Domains\Supplier\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use App\Domains\Supplier\Domain\Models\ProductSupplier;
use App\Domains\Product\Domain\Models\Product;

class Supplier extends Model
{
    protected $table = 'Suppliers';

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'CompanyName',
        'CompanyContact',
        'Email',
        'ContactNumber',
        'Viber',
        'supplier_code',
        'address',
    ];

    public function productSuppliers()
    {
        return $this->hasMany(ProductSupplier::class, 'supplier_id', 'id');
    }

    public function products()
    {
        return $this->belongsToMany(
            Product::class,
            'ProductSuppliers',
            'supplier_id',
            'product_id'
        )->withPivot([
            'id',
            'supplier_cost',
            'is_vat',
            'vat_percent',
        ]);
    }
}