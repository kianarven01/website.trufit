<?php

namespace App\Domains\Supplier\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use App\Domains\Product\Domain\Models\ProductSupplier;

class Supplier extends Model
{
    protected $table = 'Main.Suppliers';

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
    ];

    public function productSuppliers()
    {
        return $this->hasMany(ProductSupplier::class, 'supplier_id', 'id');
    }
}