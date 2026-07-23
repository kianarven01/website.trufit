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
        'type',
        'so_number',
        'remarks',
        'estimate_id',
        'vehicle_id',
        'job_order_id',
        'mileage',
        'approved_by',
        'approved_at',
        'submitted_by',
        'submitted_at',
        'cancelled_by',
        'cancelled_at',
        'completed_by',
        'completed_at',
        'started_by',
        'started_at',
    ];

    protected $casts = [
        'Total' => 'decimal:2',
        'Balance' => 'decimal:2',
        'submitted_at' => 'datetime',
        'approved_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'completed_at' => 'datetime',
        'started_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $hidden = [
        'employee',
        'approved_by',
        'submitted_by',
        'cancelled_by',
        'completed_by',
        'started_by',
    ];

    protected $appends = [
        'createdByName',
        'submittedByName',
        'approvedByName',
        'cancelledByName',
        'completedByName',
        'startedByName',
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

    public function jobOrder()
    {
        return $this->belongsTo(\App\Domains\JobOrder\Domain\Models\JobOrder::class, 'job_order_id', 'id');
    }

    public function billingStatement()
    {
        return $this->hasOne(\App\Domains\Billing\Domain\Models\BillingStatement::class, 'SOID', 'id')
                    ->where('status', '!=', 'Cancelled');
    }

    public function items()
    {
        return $this->hasMany(SalesOrderItem::class, 'SalesOrderID', 'id');
    }

    public function creator()
    {
        return $this->belongsTo(Employee::class, 'employee', 'id');
    }

    public function approvedByUser()
    {
        return $this->belongsTo(User::class, 'approved_by', 'id');
    }

    public function submittedByUser()
    {
        return $this->belongsTo(User::class, 'submitted_by', 'id');
    }

    public function cancelledByUser()
    {
        return $this->belongsTo(User::class, 'cancelled_by', 'id');
    }

    public function completedByUser()
    {
        return $this->belongsTo(User::class, 'completed_by', 'id');
    }

    public function startedByUser()
    {
        return $this->belongsTo(User::class, 'started_by', 'id');
    }

    public function getCreatedByNameAttribute(): ?string
    {
        return $this->creator
            ? trim($this->creator->first_name . ' ' . $this->creator->last_name)
            : null;
    }

    public function getApprovedByNameAttribute(): ?string
    {
        return $this->approvedByUser?->employee
            ? trim($this->approvedByUser->employee->first_name . ' ' . $this->approvedByUser->employee->last_name)
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

    public function getCompletedByNameAttribute(): ?string
    {
        return $this->completedByUser?->employee
            ? trim($this->completedByUser->employee->first_name . ' ' . $this->completedByUser->employee->last_name)
            : null;
    }

    public function getStartedByNameAttribute(): ?string
    {
        return $this->startedByUser?->employee
            ? trim($this->startedByUser->employee->first_name . ' ' . $this->startedByUser->employee->last_name)
            : null;
    }
}
