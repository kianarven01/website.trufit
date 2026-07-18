<?php

namespace App\Domains\Billing\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Domains\Auth\Domain\Models\User;

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
        'recorded_by',
    ];

    protected $casts = [
        'Amount' => 'decimal:2',
        'Date' => 'datetime',
    ];

    public function billingStatement()
    {
        return $this->belongsTo(BillingStatement::class, 'BillingID', 'id');
    }

    public function recordedByUser()
    {
        return $this->belongsTo(User::class, 'recorded_by', 'id');
    }

    public function getRecordedByNameAttribute(): ?string
    {
        if ($this->recordedByUser?->employee) {
            return trim($this->recordedByUser->employee->first_name . ' ' . $this->recordedByUser->employee->last_name);
        }
        return $this->recordedByUser?->username;
    }
}
