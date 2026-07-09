<?php

namespace App\Domains\Product\Domain\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleModel extends Model
{
    protected $table = 'VehicleModels';
    public $timestamps = false;

    protected $fillable = [
        'model',
        'image_path',
        'manufacturer_id'
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
