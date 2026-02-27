<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $table = 'Main.Roles';
    protected $fillable = ['name', 'permissions'];
    protected $casts = [
        'permissions' => 'array',
    ];
    public $timestamps = false;
}
