<?php

namespace App\Domains\Product\Domain\Models;

use Illuminate\Database\Eloquent\Model;

class Manufacturer extends Model
{
    protected $table = 'Main.Manufacturers';
    public $timestamps = false;

    protected $fillable = [
        'name',
        'type'
    ];

    public function models()
    {
        return $this->hasMany(VehicleModel::class, 'manufacturer_id');
    }
}
