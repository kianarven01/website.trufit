<?php

namespace App\Domains\JobOrder\Domain\Models;

use Illuminate\Database\Eloquent\Model;

class JobOrderService extends Model
{
    protected $table = 'Main.JobOrderServices';
    protected $primaryKey = 'id';
    public $incrementing = true;
    public $timestamps = false;

    protected $fillable = [
        'JobOrderID',
        'ServiceID',
        'PriceAtSale',
    ];

    protected $casts = [
        'PriceAtSale' => 'decimal:2',
    ];

    public function jobOrder()
    {
        return $this->belongsTo(JobOrder::class, 'JobOrderID', 'id');
    }

    public function serviceType()
    {
        return $this->belongsTo(\App\Domains\Product\Domain\Models\ServiceType::class, 'ServiceID', 'id');
    }
}
