<?php

namespace App\Domains\Supplier\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use App\Domains\Product\Domain\Models\Product;

class Supplier extends Model
{
    protected $table = 'Main.Suppliers';
    public $timestamps = false;

    protected $fillable = [
        'CompanyName',
        'CompanyContact',
        'Email',
        'ContactNumber',
        'Viber',
        'supplier_code',
    ];

    public function products()
    {
        return $this->hasMany(Product::class, 'supplier_code', 'id');
    }
}