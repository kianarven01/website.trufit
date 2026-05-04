<?php

namespace App\Domains\Customer\Domain\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $table = 'Main.Customers';
    protected $primaryKey = 'customer_id';
    public $timestamps = false;

    protected $fillable = [
        'first_name',
        'last_name',
        'address',
        'mobile_number',
        'landline',
        'email',
        'business'
    ];

    public function vehicles()
    {
        return $this->hasMany(CustomerVehicle::class, 'customerID', 'customer_id');
    }
}
