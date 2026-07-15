<?php

namespace App\Domains\SalesOrder\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Domains\Customer\Domain\Models\Customer;
use App\Domains\Customer\Domain\Models\CustomerVehicle;
use App\Domains\Estimate\Domain\Models\Estimate;
use App\Domains\Employee\Domain\Models\Employee;
use App\Domains\Auth\Domain\Models\User;

class SalesOrder extends Model
{
    use HasUuids, SoftDeletes;

    protected $table = 'SalesOrder';
    protected $primaryKey = 'id';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'employee',
        'customerID',
        'Total',
        'Balance',
        'Status',
        'StockAvailability',
        'job_order_id',
        'so_number',
        'remarks',
        'estimate_id',
        'vehicle_id',
        'mileage',
        'approved_by',
        'submitted_by',
        'submitted_at',
        'cancelled_by',
        'cancelled_at',
        'completed_at',
    ];

    protected $casts = [
        'Total' => 'decimal:2',
        'Balance' => 'decimal:2',
        'submitted_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'completed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $hidden = [
        'employee',
        'approved_by',
        'submitted_by',
        'cancelled_by',
    ];

    protected $appends = [
        'createdByName',
        'submittedByName',
        'approvedByName',
        'cancelledByName',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customerID', 'customer_id');
    }

    public function vehicle()
    {
        return $this->belongsTo(CustomerVehicle::class, 'vehicle_id', 'id');
    }

    public function estimate()
    {
        return $this->belongsTo(Estimate::class, 'estimate_id', 'id');
    }

    public function items()
    {
        return $this->hasMany(SalesOrderItem::class, 'SalesOrderID', 'id');
    }

    public function creator()
    {
        return $this->belongsTo(Employee::class, 'employee', 'id');
    }

    public function approver()
    {
        return $this->belongsTo(Employee::class, 'approved_by', 'id');
    }

    public function approvedByEmployee()
    {
        return $this->belongsTo(Employee::class, 'approved_by', 'id');
    }

    public function submittedByUser()
    {
        return $this->belongsTo(User::class, 'submitted_by', 'id');
    }

    public function cancelledByUser()
    {
        return $this->belongsTo(User::class, 'cancelled_by', 'id');
    }

    public function getCreatedByNameAttribute(): ?string
    {
        return $this->creator
            ? trim($this->creator->first_name . ' ' . $this->creator->last_name)
            : null;
    }

    public function getApprovedByNameAttribute(): ?string
    {
        return $this->approvedByEmployee
            ? trim($this->approvedByEmployee->first_name . ' ' . $this->approvedByEmployee->last_name)
            : null;
    }

    public function getSubmittedByNameAttribute(): ?string
    {
        return $this->submittedByUser?->employee
            ? trim($this->submittedByUser->employee->first_name . ' ' . $this->submittedByUser->employee->last_name)
            : null;
    }

    public function getCancelledByNameAttribute(): ?string
    {
        return $this->cancelledByUser?->employee
            ? trim($this->cancelledByUser->employee->first_name . ' ' . $this->cancelledByUser->employee->last_name)
            : null;
    }
}
