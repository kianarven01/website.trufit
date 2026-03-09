<?php

namespace App\Domains\Product\Domain\Models;

use Illuminate\Database\Eloquent\Model;

class Unit extends Model
{
    protected $table = 'Main.UnitOfMeasure';

    protected $fillable = [
        'name'
    ];

    public function products()
    {
        return $this->hasMany(Product::class, 'unit');
    }
}