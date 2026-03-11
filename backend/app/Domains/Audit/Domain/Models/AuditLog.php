<?php

namespace App\Domains\Audit\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use App\Domains\Employee\Domain\Models\Employee;

class AuditLog extends Model
{
    protected $table = 'Main.AuditLogs';
    public $timestamps = false; // We use created_at only

    protected $fillable = [
        'employee_id',
        'event_type',
        'action',
        'auditable_type',
        'auditable_id',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
        'created_at'
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'created_at' => 'datetime'
    ];

    public function actor()
    {
        return $this->belongsTo(Employee::class, 'employee_id', 'id');
    }

    public function auditable()
    {
        return $this->morphTo();
    }
}