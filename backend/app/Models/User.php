<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;




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

    /**
     * Tell Laravel to use 'userName' instead of 'email' for authentication
     */

    public function getUsername()
    {
        return $this->userName;
    }

    public function getAuthPassword()
    {
        return $this->password_hash;
    }
}
