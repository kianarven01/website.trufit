<?php

namespace App\Domains\Vehicle\Domain\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleVariant extends Model
{
    public $timestamps = false;

    protected $table = 'Main.VehicleVariants';

    protected $fillable = [
        'car_model_id',
        'variant_name',
        'engine_displacement',
        'year',
        'transmission_type',
        'drivetrain',
        'oil_capacity',
        'service_class',
        'fuel_type',
        'body_type',
    ];

    protected $casts = [
        'car_model_id' => 'integer',
        'oil_capacity' => 'integer',
    ];

    public function vehicleModel()
    {
        return $this->belongsTo(VehicleModel::class, 'car_model_id');
    }
}