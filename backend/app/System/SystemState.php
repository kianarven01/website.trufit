<?php

namespace App\System;
use App\Models\User;


class SystemState{

    public static function initialize(): bool  
    {
        return User::where('role', 'admin')->exists();
    }

}