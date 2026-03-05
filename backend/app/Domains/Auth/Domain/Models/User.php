<?php

namespace App\Domains\Auth\Domain\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Domains\Employee\Domain\Models\Employee; // Import the related model

class User extends Authenticatable
{
    use HasApiTokens;

    protected $table = 'Main.UserCredentials';

    protected $fillable = [
        'username', 
        'password_hash', 
        'employeeID' 
    ];

    public function employee(): BelongsTo
    {
        // Maps 'employeeID' from UserCredentials to 'id' in Employees
        return $this->belongsTo(Employee::class, 'employeeID', 'id');
    }

    public function getAuthPassword()
    {
        return $this->password_hash;
    }
  
}