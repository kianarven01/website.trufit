<?php

namespace App\Domains\Role\Domain\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $table = 'Main.Roles';

    protected $fillable = [
        'name', 
        'permissions'
    ];

    protected $casts = [
        'permissions' => 'array', 
    ];
}