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

    public function hasPermission($module, $action = null)
    {
        // Access permissions through the relationship chain [cite: 11, 24]
        $permissions = $this->employee->role->permissions ?? [];

        if (isset($permissions['all']) && $permissions['all'] === true) {
            return true;
        }

        if (is_null($action)) {
            return isset($permissions[$module]) && $permissions[$module] === true;
        }

        return isset($permissions[$module]) && in_array($action, (array)$permissions[$module]);
    }
}
