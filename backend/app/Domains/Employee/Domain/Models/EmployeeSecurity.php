<?php

namespace App\Domains\Employee\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeSecurity extends Model
{
    protected $table = 'Main.EmployeeSecurity';
    protected $primaryKey = 'employee_id';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'employee_id',
        'email_verified_at',
        'email_verification_code',
        'email_verification_expires_at',
        'phone_verified_at',
        'phone_verification_code',
        'phone_verification_expires_at',
        'password_reset_code',
        'password_reset_expires_at',
        'failed_login_attempts',
        'lockout_until',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'email_verification_expires_at' => 'datetime',
        'phone_verified_at' => 'datetime',
        'phone_verification_expires_at' => 'datetime',
        'password_reset_expires_at' => 'datetime',
        'lockout_until' => 'datetime',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id', 'id');
    }
}