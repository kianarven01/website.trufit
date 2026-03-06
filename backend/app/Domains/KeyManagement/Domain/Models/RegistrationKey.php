<?php

namespace App\Domains\KeyManagement\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use App\Domains\Employee\Domain\Models\Employee;


class RegistrationKey extends Model
{

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id'); 
    }
    protected $table = 'Main.RegistrationKeys';

    protected $fillable = [
        'employee_name',
        'email',
        'key_code',
        'is_used',
        'expires_at',
        'position',
        'roleID'
    ];

    protected $casts = [
        'is_used' => 'boolean',
        'expires_at' => 'datetime',
    ];
}