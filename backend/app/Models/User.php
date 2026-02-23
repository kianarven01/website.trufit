<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Models\Employee;
use App\Models\Role;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;


    protected $table = 'Main.UserCredentials';
    protected $primaryKey = 'id';

    protected $fillable = [
        'username',
        'password_hash',
        'employeeID',
    ];

    public function getUsername()
    {
        return $this->userName;
    }

    public function getAuthPassword()
    {
        return $this->password_hash;
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employeeID');
    }

    public function role()
    {
        return $this->hasOneThrough(Role::class, Employee::class, 'id', 'id', 'employeeID', 'roleID');
    }
}
