<?php

namespace App\Domains\Customer\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use App\Domains\Product\Domain\Models\VehicleVariant;

/**
 * @mixin \Illuminate\Database\Eloquent\Builder
 */
class CustomerVehicle extends Model
{
    protected $table = 'CustomerVehicles';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $fillable = [
        'customerID',
        'plate_number',
        'engine_number',
        'VIN',
        'color',
        'registration_number', 
        'year_model',
        'make',
        'model',
        'variant',
        'selling_dealer',
        'vehicle_variant_id'
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customerID', 'customer_id');
    }

    public function vehicleVariant()
    {
        return $this->belongsTo(\App\Domains\Product\Domain\Models\VehicleVariant::class, 'vehicle_variant_id');
    }
}
