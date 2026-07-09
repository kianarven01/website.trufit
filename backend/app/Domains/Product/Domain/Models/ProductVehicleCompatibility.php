<?php

namespace App\Domains\Product\Domain\Models;

use App\Domains\Vehicle\Domain\Models\VehicleVariant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ProductVehicleCompatibility extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $table = 'ProductVehicleCompatibility';

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
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
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }

    public function vehicleVariant()
    {
        return $this->belongsTo(VehicleVariant::class, 'car_variant_id');
    }
}