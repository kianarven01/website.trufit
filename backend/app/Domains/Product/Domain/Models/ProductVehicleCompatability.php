<?php

namespace App\Domains\Product\Domain\Models;

use App\Domains\Vehicle\Domain\Models\VehicleVariant;
use Illuminate\Database\Eloquent\Model;

class ProductVehicleCompatibility extends Model
{
    public $timestamps = false;

    protected $table = 'Main.ProductVehicleCompatibility';

    protected $fillable = [
        'product_id',
        'car_variant_id',
        'notes',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function vehicleVariant()
    {
        return $this->belongsTo(VehicleVariant::class, 'car_variant_id');
    }
}