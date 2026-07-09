<?php

namespace App\Domains\Role\Domain\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{

   
    protected $table = 'Roles';
    public $timestamps = false;

    protected $fillable = [
        'name', 
        'permissions'
    ];

    protected $casts = [
        'permissions' => 'array', 
    ];
}