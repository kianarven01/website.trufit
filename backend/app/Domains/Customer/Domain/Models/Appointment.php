<?php

namespace App\Domains\Customer\Domain\Models;

use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    protected $table = 'Main.Appointments';

    protected $fillable = [
        'appointment_code',
        'customer_id',
        'plate_number',
        'first_name',
        'last_name',
        'phone',
        'email',
        'make',
        'model',
        'year',
        'appointment_datetime',
        'status',
        'services',
        'notes'
    ];

    protected $casts = [
        'appointment_datetime' => 'datetime',
        'services' => 'array',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'customer_id');
    }

    public function vehicle()
    {
        return $this->belongsTo(CustomerVehicle::class, 'plate_number', 'plate_number');
    }
}
