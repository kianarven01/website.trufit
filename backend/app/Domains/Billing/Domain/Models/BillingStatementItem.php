<?php

namespace App\Domains\Billing\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class BillingStatementItem extends Model
{
    use HasUuids;

    protected $table = 'Main.BillingStatementItems';
    protected $primaryKey = 'id';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'BillingStatementID',
        'name',
        'quantity',
        'UnitPrice',
        'SubTotal',
        'type',
    ];

    protected $casts = [
        'UnitPrice' => 'decimal:2',
        'SubTotal' => 'decimal:2',
        'quantity' => 'integer',
    ];

    public function billingStatement()
    {
        return $this->belongsTo(BillingStatement::class, 'BillingStatementID', 'id');
    }
}
