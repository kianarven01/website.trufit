<?php

namespace App\Domains\Auth\Domain\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $table = 'Main.UserCredentials';
    protected $fillable = ['username', 'password_hash', 'employeeID'];

    public function getAuthPassword()
    {
        return $this->password_hash;
    }
}