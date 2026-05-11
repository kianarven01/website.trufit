<?php

namespace App\Domains\Product\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ServiceType extends Model
{
    use HasUuids;

    protected $table = 'Main.ServiceType';
    public $timestamps = false; 
    protected $fillable = [
        'name',
        'category',
        'price',
        'description',
        'pricing_type',
        'duration'
    ];

    public function pricings()
    {
        return $this->hasMany(ServicePricing::class, 'service_type_id');
    }
}
