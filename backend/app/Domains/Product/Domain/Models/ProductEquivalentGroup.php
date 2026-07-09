<?php

namespace App\Domains\Product\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ProductEquivalentGroup extends Model
{
    protected $table = 'ProductEquivalentGroups';
    protected $primaryKey = 'id';

    public $incrementing = false;
    protected $keyType = 'string';

    public $timestamps = true;

    protected $fillable = [
        'id',
        'name',
        'part_id',
        'notes',
    ];

    protected $casts = [
        'id' => 'string',
        'part_id' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($group) {
            if (empty($group->id)) {
                $group->id = (string) Str::uuid();
            }
        });
    }

    public function part()
    {
        return $this->belongsTo(Part::class, 'part_id', 'id');
    }

    public function items()
    {
        return $this->hasMany(
            ProductEquivalentGroupItem::class,
            'group_id',
            'id'
        );
    }

    public function products()
    {
        return $this->belongsToMany(
            Product::class,
            'ProductEquivalentGroupItems',
            'group_id',
            'product_id'
        )->withPivot(['id']);
    }
}