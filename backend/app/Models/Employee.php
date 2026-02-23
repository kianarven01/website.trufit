<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    protected $table = 'Main.Employees';

    public function role()
    {
        return $this->belongsTo(Role::class, 'roleID');
    }
}
