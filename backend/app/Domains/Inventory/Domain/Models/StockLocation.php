<?php

namespace App\Domains\Inventory\Domain\Models;

use Illuminate\Database\Eloquent\Model;

class StockLocation extends Model
{
    public $timestamps = false;

    protected $table = 'StockLocations';

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'code',
        'name',
        'description',
        'is_active',
        'created_at',
    ];

    protected $casts = [
        'id' => 'string',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
    ];

    public function bins()
    {
        return $this->hasMany(BinLocation::class, 'warehouse_id', 'id');
    }
}
