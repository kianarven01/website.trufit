<?php

namespace App\Domains\Product\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use App\Domains\Vehicle\Domain\Models\VehicleModel;

class Manufacturers extends Model
{
    public $timestamps = false;

    protected $table = 'Manufacturers';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $keyType = 'int';

    protected $fillable = [
        'name',
        'type',
        'code',
    ];

    protected $casts = [
        'id' => 'integer',
        'code' => 'string',
    ];
    public function products()
    {
        return $this->hasMany(Product::class, 'manufacturer_id', 'id');
    }

    public function vehicleModels()
    {
        return $this->hasMany(VehicleModel::class, 'manufacturer_id', 'id');
    }
}