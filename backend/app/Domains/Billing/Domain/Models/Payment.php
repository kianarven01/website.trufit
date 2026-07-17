<?php

namespace App\Domains\Billing\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Payment extends Model
{
    use HasUuids;

    protected $table = 'Payment';
    protected $primaryKey = 'id';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'BillingID',
        'Amount',
        'Date',
        'PaymentMethod',
        'ReferenceNumber',
        'Type',
    ];

    protected $casts = [
        'Amount' => 'decimal:2',
        'Date' => 'datetime',
    ];

    public function billingStatement()
    {
        return $this->belongsTo(BillingStatement::class, 'BillingID', 'id');
    }
}
