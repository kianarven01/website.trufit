<?php

namespace App\Domains\Employee\Domain\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Domains\Role\Domain\Models\Role;

class Employee extends Model
{
    protected $table = 'Main.Employees';
    public $timestamps = false;

    public $incrementing = false;
    protected $keyType = 'int';

    protected $fillable = [
            'id',
            'name',
            'email',
            'address',
            'phone',
            'position',
            'roleID',
            'status'
        ];

    public function role(): BelongsTo
    {
        // Maps 'roleID' in Employees to 'id' in Roles
        return $this->belongsTo(Role::class, 'roleID', 'id');
    }
}