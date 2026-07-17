<?php

namespace App\Domains\JobOrder\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use App\Domains\Employee\Domain\Models\Employee;

class JobOrderTechnician extends Model
{
    protected $table = 'Main.JobOrderTechnicians';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $fillable = [
        'JobOrderID',
        'employee_id',
        'role',
        'assigned_at',
        'removed_at',
        'accumulated_seconds',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'removed_at' => 'datetime',
        'accumulated_seconds' => 'integer',
    ];

    public function jobOrder()
    {
        return $this->belongsTo(JobOrder::class, 'JobOrderID', 'id');
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id', 'id');
    }

    public function getEmployeeNameAttribute(): ?string
    {
        return $this->employee
            ? trim($this->employee->first_name . ' ' . $this->employee->last_name)
            : null;
    }
}
