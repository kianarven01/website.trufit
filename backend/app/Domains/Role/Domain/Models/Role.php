<?php

namespace App\Domains\Role\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Domains\Employee\Domain\Models\Employee;

class Role extends Model
{
    protected $table = 'Roles';
    public $timestamps = false;

    protected $fillable = [
        'name',
        'permissions',
    ];

    protected $casts = [
        'permissions' => 'array',
    ];

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class, 'roleID', 'id');
    }
}