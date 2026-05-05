<?php

namespace App\Domains\Employee\Domain\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Domains\Role\Domain\Models\Role;

use Illuminate\Database\Eloquent\Relations\HasOne;

class Employee extends Model
{
    protected $table = 'Main.Employees';
    public $timestamps = false;

    public $incrementing = false;
    protected $keyType = 'int';

    protected $fillable = [
            'id',
            'first_name',
            'last_name',
            'email',
            'address',
            'phone',
            'position',
            'roleID',
            'status'
        ];

    protected $casts = [
        'status' => 'boolean',
        'address' => 'encrypted',
        'phone' => 'encrypted',
    ];

    public function security(): HasOne
    {
        return $this->hasOne(EmployeeSecurity::class, 'employee_id', 'id');
    }

    public function hasVerifiedEmail(): bool
    {
        return ! is_null($this->security?->email_verified_at);
    }

    public function hasVerifiedPhone(): bool
    {
        return ! is_null($this->security?->phone_verified_at);
    }

    public function role(): BelongsTo
    {
        // Maps 'roleID' in Employees to 'id' in Roles
        return $this->belongsTo(Role::class, 'roleID', 'id');
    }
}