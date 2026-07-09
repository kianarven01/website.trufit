<?php

namespace App\Domains\Inventory\Domain\Models;

use Illuminate\Database\Eloquent\Model;

class BinLocation extends Model
{
    public $timestamps = false;

    protected $table = 'BinLocations';

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'warehouse_id',
        'code',
        'name',
        'is_active',
        'created_at',
    ];

    protected $casts = [
        'id' => 'string',
        'warehouse_id' => 'string',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
    ];

    public function warehouse()
    {
        return $this->belongsTo(StockLocation::class, 'warehouse_id', 'id');
    }
}
