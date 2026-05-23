<?php

namespace App\Domains\Product\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ServicePricing extends Model
{
    use HasUuids;

    protected $table = 'Main.ServicePricing';
    public $timestamps = false;

    protected $fillable = [
        'service_type_id',
        'vehicle_size_name',
        'vehicle_types',
        'price',
        'pricing_type'
    ];

    protected $casts = [
        'vehicle_types' => 'array',
    ];

    public function serviceType()
    {
        return $this->belongsTo(ServiceType::class, 'service_type_id');
    }
}
