<?php

namespace App\Domains\Billing\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Domains\Customer\Domain\Models\Customer;
use App\Domains\Customer\Domain\Models\CustomerVehicle;
use App\Domains\SalesOrder\Domain\Models\SalesOrder;
use App\Domains\Auth\Domain\Models\User;

class BillingStatement extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'BillingStatement';
    protected $primaryKey = 'id';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'CustomerID',
        'SOID',
        'JOID',
        'Date',
        'Total',
        'status',
        'bill_number',
        'vehicle_id',
        'tax',
        'notes',
        'discount_type',
        'discount_value',
        'created_by',
    ];

    protected $casts = [
        'Total' => 'decimal:2',
        'tax' => 'decimal:2',
        'discount_value' => 'decimal:2',
        'Date' => 'datetime',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'CustomerID', 'customer_id');
    }

    public function vehicle()
    {
        return $this->belongsTo(CustomerVehicle::class, 'vehicle_id', 'id');
    }

    public function salesOrder()
    {
        return $this->belongsTo(SalesOrder::class, 'SOID', 'id');
    }

    public function jobOrder()
    {
        return $this->belongsTo(\App\Domains\JobOrder\Domain\Models\JobOrder::class, 'JOID', 'id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'BillingID', 'id');
    }

    public function items()
    {
        return $this->hasMany(BillingStatementItem::class, 'BillingStatementID', 'id');
    }

    public function createdByUser()
    {
        return $this->belongsTo(User::class, 'created_by', 'id');
    }

    public function getCreatedByNameAttribute(): ?string
    {
        if ($this->createdByUser?->employee) {
            return trim($this->createdByUser->employee->first_name . ' ' . $this->createdByUser->employee->last_name);
        }
        return $this->createdByUser?->username;
    }

    public function getDiscountAmountAttribute(): float
    {
        $total = (float) $this->Total;
        if ($this->discount_type === 'fixed') {
            return (float) $this->discount_value;
        }
        if ($this->discount_type === 'percent') {
            return round($total * ((float) $this->discount_value / 100), 2);
        }
        return 0;
    }

    public function getEffectiveTotalAttribute(): float
    {
        return (float) $this->Total - $this->discount_amount;
    }
}
