<?php

namespace App\Domains\Product\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ProductEquivalentGroupItem extends Model
{
    protected $table = 'ProductEquivalentGroupItems';
    protected $primaryKey = 'id';

    public $incrementing = false;
    protected $keyType = 'string';

    public $timestamps = true;

    protected $fillable = [
        'id',
        'group_id',
        'product_id',
    ];

    protected $casts = [
        'id' => 'string',
        'group_id' => 'string',
        'product_id' => 'string',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($item) {
            if (empty($item->id)) {
                $item->id = (string) Str::uuid();
            }
        });
    }

    public function group()
    {
        return $this->belongsTo(
            ProductEquivalentGroup::class,
            'group_id',
            'id'
        );
    }

    public function product()
    {
        return $this->belongsTo(
            Product::class,
            'product_id',
            'id'
        );
    }
}