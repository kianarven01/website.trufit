<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    protected $table = 'Employees';

    protected $fillable = [
        'name',
        'email',
        'position',
        'roleID',
        'status',
        'phone',
        'join_date'
    ];

    public function role()
    {
        return $this->belongsTo(Role::class, 'roleID');
    }
}
