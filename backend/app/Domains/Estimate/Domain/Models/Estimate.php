<?php

namespace App\Domains\Estimate\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Domains\Customer\Domain\Models\Customer;
use App\Domains\Customer\Domain\Models\CustomerVehicle;

class Estimate extends Model
{
    use HasUuids;

    protected $table = 'Main.Estimates';
    protected $primaryKey = 'id';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'customer_id',
        'vehicle_id',
        'vehicle_id_old',
        'status',
        'total_amount',
        'mileage',
        'estimate_number',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'customer_id');
    }

    public function vehicle()
    {
        return $this->belongsTo(CustomerVehicle::class, 'vehicle_id', 'id');
    }

    public function items()
    {
        return $this->hasMany(EstimateItem::class, 'estimate_id', 'id');
    }
}
