<?php

namespace App\Domains\Purchasing\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;
use App\Domains\Auth\Domain\Models\User;

class GoodsReceipt extends Model
{
    protected $table = 'GoodsReceipts';
    protected $primaryKey = 'id';

    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = true;

    protected $fillable = [
        'id',
        'receipt_number',
        'purchase_order_id',
        'status',
        'received_at',
        'approved_at',
        'cancelled_at',
        'received_by',
        'approved_by',
        'cancelled_by',
        'notes',
    ];

    protected $casts = [
        'id' => 'string',
        'purchase_order_id' => 'string',
        'received_at' => 'datetime',
        'approved_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = [
        'received_by_name',
        'approved_by_name',
        'cancelled_by_name',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($receipt) {
            if (empty($receipt->id)) {
                $receipt->id = (string) Str::uuid();
            }

            if (empty($receipt->status)) {
                $receipt->status = 'DRAFT';
            }
        });
    }

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class, 'purchase_order_id', 'id');
    }

    public function items()
    {
        return $this->hasMany(GoodsReceiptItem::class, 'goods_receipt_id', 'id');
    }

    public function receivedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by', 'id');
    }

    public function approvedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by', 'id');
    }

    public function cancelledByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by', 'id');
    }

    public function getReceivedByNameAttribute(): ?string
    {
        return $this->receivedByUser?->employee
            ? trim($this->receivedByUser->employee->first_name . ' ' . $this->receivedByUser->employee->last_name)
            : null;
    }

    public function getApprovedByNameAttribute(): ?string
    {
        return $this->approvedByUser?->employee
            ? trim($this->approvedByUser->employee->first_name . ' ' . $this->approvedByUser->employee->last_name)
            : null;
    }

    public function getCancelledByNameAttribute(): ?string
    {
        return $this->cancelledByUser?->employee
            ? trim($this->cancelledByUser->employee->first_name . ' ' . $this->cancelledByUser->employee->last_name)
            : null;
    }
}
