<?php

namespace App\Domains\Product\Domain\Models;

use Illuminate\Database\Eloquent\Model;

class Part extends Model
{
    protected $table = 'Main.Parts';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $keyType = 'int';

    public $timestamps = false;

    protected $fillable = [
        'name',
        'description',
        'category_id',
        'code',
    ];
    protected $casts = [
        'id' => 'integer',
        'category_id' => 'integer',
        'code' => 'string',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'id');
    }

    public function products()
    {
        return $this->hasMany(Product::class, 'part_id', 'id');
    }
}