<?php

namespace App\Domains\Product\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use App\Domains\Vehicle\Domain\Models\VehicleModel;

class Manufacturers extends Model
{
    public $timestamps = false;

    protected $table = 'Main.Manufacturers';

    protected $fillable = [
        'name',
    ];

    public function vehicleModels()
    {
        return $this->hasMany(VehicleModel::class, 'manufacturer_id');
    }
}
