<?php

namespace App\Domains\Vehicle\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use App\Domains\Product\Domain\Models\Manufacturers;

class VehicleModel extends Model
{
    public $timestamps = false;

    protected $table = 'VehicleModels';

    protected $fillable = [
        'manufacturer_id',
        'model',
        'image_path',
    ];

    public function manufacturer()
    {
        return $this->belongsTo(Manufacturers::class, 'manufacturer_id');
    }

    public function variants()
    {
        return $this->hasMany(VehicleVariant::class, 'car_model_id');
    }
}
