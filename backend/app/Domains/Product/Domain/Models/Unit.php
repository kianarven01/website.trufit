<?php

namespace App\Domains\Product\Domain\Models;

use Illuminate\Database\Eloquent\Model;

class Unit extends Model
{
    protected $table = 'UnitOfMeasure';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $keyType = 'int';

    public $timestamps = false;

    protected $fillable = [
        'name',
        'abbreviation',
    ];

    protected $casts = [
        'id' => 'integer',
    ];

    public function products()
    {
        return $this->hasMany(Product::class, 'unit', 'id');
    }
}