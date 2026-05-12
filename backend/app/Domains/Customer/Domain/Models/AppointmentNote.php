<?php

namespace App\Domains\Customer\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use App\Domains\Auth\Domain\Models\User;

class AppointmentNote extends Model
{
    protected $table = 'Main.AppointmentNotes';

    protected $fillable = [
        'user_id',
        'key',
        'data',
    ];

    protected $casts = [
        'data' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
