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
        'service_category_id',
        'price',
        'tasks',
        'pricing_type',
        'duration'
    ];

    protected $casts = [
        'tasks' => 'array',
    ];

    public function pricings()
    {
        return $this->hasMany(ServicePricing::class, 'service_type_id');
    }

    public function serviceCategory()
    {
        return $this->belongsTo(ServiceCategory::class, 'service_category_id');
    }
}
