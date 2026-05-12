<?php

namespace App\Domains\Product\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use App\Domains\Vehicle\Domain\Models\VehicleModel;

class Manufacturers extends Model
{
    public $timestamps = false;

    protected $table = 'Main.Manufacturers';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $keyType = 'int';

    protected $fillable = [
        'name',
        'type',
    ];

    protected $casts = [
        'id' => 'integer',
    ];

    public function vehicleModels()
    {
        return $this->hasMany(VehicleModel::class, 'manufacturer_id', 'id');
    }
}