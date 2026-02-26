<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RegistrationKey extends Model
{
    protected $table = 'RegistrationKeys';

    protected $fillable = [
        'key_code',
        'role_id',
        'is_used',
        'expires_at'
    ];

    public $timestamps = false;
}
