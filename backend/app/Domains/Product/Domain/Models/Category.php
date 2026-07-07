<?php

namespace App\Domains\Product\Domain\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    const SUNDRIES_CATEGORY_NAME = 'Sundries';

    protected $table = 'Main.Category';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $keyType = 'int';

    public $timestamps = false;

    protected $fillable = [
        'name',
        'seq_counter',
        'is_active',
        'is_spol',
    ];

    protected $casts = [
        'id' => 'integer',
        'seq_counter' => 'integer',
        'is_active' => 'boolean',
        'is_spol' => 'boolean',
    ];

    public function products()
    {
        return $this->hasMany(Product::class, 'category_id', 'id');
    }

    public function parts()
    {
        return $this->hasMany(Part::class, 'category_id', 'id');
    }

    public function isSystem(): bool
    {
        return $this->name === self::SUNDRIES_CATEGORY_NAME;
    }
}