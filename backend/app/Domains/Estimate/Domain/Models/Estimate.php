<?php

namespace App\Domains\Estimate\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Domains\Customer\Domain\Models\Customer;
use App\Domains\Customer\Domain\Models\CustomerVehicle;

class Estimate extends Model
{
    use HasUuids;

    protected $table = 'Estimates';
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
        'downpayment_amount',
        'payment_method',
        'payment_reference',
        'created_by',
        'edited_by',
        'approved_by',
        'notes',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'downpayment_amount' => 'decimal:2',
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

    public function creator()
    {
        return $this->belongsTo(\App\Domains\Employee\Domain\Models\Employee::class, 'created_by', 'id');
    }

    public function editor()
    {
        return $this->belongsTo(\App\Domains\Employee\Domain\Models\Employee::class, 'edited_by', 'id');
    }

    public function approver()
    {
        return $this->belongsTo(\App\Domains\Employee\Domain\Models\Employee::class, 'approved_by', 'id');
    }
}
