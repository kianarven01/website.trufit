<?php

namespace App\Domains\Employee\Domain\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Domains\Role\Domain\Models\Role;

class Employee extends Model
{
    protected $table = 'Main.Employees';

    protected $fillable = [
        'first_name', 
        'last_name', 
        'email', 
        'roleID' 
    ];

    public function role(): BelongsTo
    {
        // Maps 'roleID' in Employees to 'id' in Roles
        return $this->belongsTo(Role::class, 'roleID', 'id');
    }
}