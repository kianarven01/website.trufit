<?php

namespace App\Domains\Product\Domain\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $table = 'Main.Category';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $keyType = 'int';

    public $timestamps = false;

    protected $fillable = [
        'name',
        'code',
        'seq_counter',
        'is_active',
        'archived_at',
    ];

    protected $casts = [
        'id' => 'integer',
        'seq_counter' => 'integer',
        'is_active' => 'boolean',
        'archived_at' => 'datetime',
    ];

    public function products()
    {
        return $this->hasMany(Product::class, 'category_id', 'id');
    }

    public function parts()
    {
        return $this->hasMany(Part::class, 'category_id', 'id');
    }
}