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
            'email_verified_at',
            'verification_code',
            'address',
            'phone',
            'phone_verified_at',
            'phone_verification_code',
            'position',
            'roleID',
            'status'
        ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'phone_verified_at' => 'datetime',
        'status' => 'boolean',
    ];

    public function hasVerifiedEmail(): bool
    {
        return ! is_null($this->email_verified_at);
    }

    public function hasVerifiedPhone(): bool
    {
        return ! is_null($this->phone_verified_at);
    }

    public function role(): BelongsTo
    {
        // Maps 'roleID' in Employees to 'id' in Roles
        return $this->belongsTo(Role::class, 'roleID', 'id');
    }
}