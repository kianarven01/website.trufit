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
        'year_start',
        'year_end',
        'transmission_type',
        'oil_capacity',
        'service_class',
    ];

    protected $casts = [
        'car_model_id' => 'integer',
        'engine_displacement' => 'integer',
        'year_start' => 'integer',
        'year_end' => 'integer',
        'oil_capacity' => 'integer',
    ];

    public function vehicleModel()
    {
        return $this->belongsTo(VehicleModel::class, 'car_model_id');
    }
}