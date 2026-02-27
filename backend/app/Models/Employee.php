<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    protected $table = 'Main.Employees';

    public $incrementing = false;
    protected $keyType = 'int';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'name',
        'email',
        'position',
        'roleID',
        'status',
        'phone',
        'address',
        'join_date'
    ];

    public function role()
    {
        return $this->belongsTo(Role::class, 'roleID');
    }

    protected static function booted()
    {
        static::creating(function ($employee) {
            do {
                $randomId = mt_rand(10000000, 99999999);
            } while (static::where('id', $randomId)->exists());

            $employee->id = $randomId;
        });
    }
}
