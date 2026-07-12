<?php

namespace App\Domains\Purchasing\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use App\Domains\Auth\Domain\Models\User;

class SupplierBill extends Model
{
    use SoftDeletes;

    protected $table = 'SupplierBills';
    protected $primaryKey = 'id';

    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = true;

    protected $fillable = [
        'id',
        'bill_number',
        'purchase_order_id',
        'status',
        'bill_date',
        'due_date',
        'total_amount',
        'notes',
        'created_by',
        'approved_by',
        'paid_by',
        'paid_at',
        'voided_by',
        'voided_at',
    ];

    protected $casts = [
        'id' => 'string',
        'purchase_order_id' => 'string',
        'bill_date' => 'date',
        'due_date' => 'date',
        'total_amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'voided_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $hidden = [
        'created_by',
        'approved_by',
        'paid_by',
        'voided_by',
    ];

    protected $appends = [
        'createdByName',
        'approvedByName',
        'paidByName',
        'voidedByName',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($bill) {
            if (empty($bill->id)) {
                $bill->id = (string) Str::uuid();
            }

            if (empty($bill->status)) {
                $bill->status = 'DRAFT';
            }
        });
    }

    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class, 'purchase_order_id', 'id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(SupplierBillItem::class, 'supplier_bill_id', 'id');
    }

    public function createdByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by', 'id');
    }

    public function approvedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by', 'id');
    }

    public function paidByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'paid_by', 'id');
    }

    public function voidedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'voided_by', 'id');
    }

    public function getCreatedByNameAttribute(): ?string
    {
        return $this->createdByUser?->employee
            ? trim($this->createdByUser->employee->first_name . ' ' . $this->createdByUser->employee->last_name)
            : null;
    }

    public function getApprovedByNameAttribute(): ?string
    {
        return $this->approvedByUser?->employee
            ? trim($this->approvedByUser->employee->first_name . ' ' . $this->approvedByUser->employee->last_name)
            : null;
    }

    public function getPaidByNameAttribute(): ?string
    {
        return $this->paidByUser?->employee
            ? trim($this->paidByUser->employee->first_name . ' ' . $this->paidByUser->employee->last_name)
            : null;
    }

    public function getVoidedByNameAttribute(): ?string
    {
        return $this->voidedByUser?->employee
            ? trim($this->voidedByUser->employee->first_name . ' ' . $this->voidedByUser->employee->last_name)
            : null;
    }
}
