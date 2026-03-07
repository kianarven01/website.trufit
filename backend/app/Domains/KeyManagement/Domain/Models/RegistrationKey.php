<?php

namespace App\Domains\KeyManagement\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use App\Domains\Employee\Domain\Models\Employee;
use App\Domains\Role\Domain\Models\Role;


class RegistrationKey extends Model
{

    public function employee()
    {
        // Links employee_id in this table to id in Employees table
        return $this->belongsTo(Employee::class, 'employee_id', 'id');
    }

    public function role()
    {
        // Links role_id in this table to id in Roles table
        return $this->belongsTo(Role::class, 'role_id', 'id');
    }

    protected $table = 'Main.RegistrationKeys';
    public $timestamps = false;

    protected $fillable = [
        'employee_id',
        'employee_name',
        'email',
        'key_code',
        'is_used',
        'expires_at',
        'position',
        'role_id'
    ];


    protected $casts = [
        'is_used' => 'boolean',
        'expires_at' => 'datetime',
    ];
}