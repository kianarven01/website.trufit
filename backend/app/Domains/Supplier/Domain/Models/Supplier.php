<?php

namespace App\Domains\Supplier\Domain\Models;

use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    protected $table = 'Suppliers';

    protected $fillable = [
        'supplier_code',
        'CompanyName',
    ];

    public function products()
    {
        return $this->hasMany(
            \App\Domains\Product\Domain\Models\Product::class,
            'supplier_code',
            'supplier_code'
        );
    }
}