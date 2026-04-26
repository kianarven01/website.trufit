<?php

namespace App\Domains\Product\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Category extends Model
{
    use HasUuids;

    protected $table = 'Main.Category';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'name',
        'code',
    ];

    public function products()
    {
        return $this->hasMany(Product::class, 'category_id', 'id');
    }
}