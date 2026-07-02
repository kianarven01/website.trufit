<?php

namespace App\Domains\Product\Domain\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleVariant extends Model
{
    protected $table = 'Main.VehicleVariants';
    public $timestamps = false;

    protected $fillable = [
        'car_model_id',
        'variant_name',
        'engine_displacement',
        'year',
        'transmission_type',
        'oil_capacity',
        'service_class',
        'drivetrain',
        'fuel_type',
        'body_type',
    ];

    public function vehicleModel()
    {
        return $this->belongsTo(VehicleModel::class, 'car_model_id');
    }
}
