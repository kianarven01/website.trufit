<?php

namespace App\Domains\Product\Domain\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $table = 'Main.Category';

    protected $fillable = [
        'name',
        'code'
    ];

    public function products()
    {
        return $this->hasMany(Product::class, 'category_id');
    }
}