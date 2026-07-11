<?php

namespace App\Domains\Purchasing\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use App\Domains\Supplier\Domain\Models\Supplier;
use App\Domains\Auth\Domain\Models\User;

class PurchaseOrder extends Model
{
    use SoftDeletes;

    protected $table = 'PurchaseOrders';
    protected $primaryKey = 'id';

    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = true;

    protected $fillable = [
        'id',
        'po_number',
        'supplier_id',
        'order_date',
        'request_ship_date',
        'eta',
        'status',
        'subtotal',
        'total_amount',
        'remarks',
        'submitted_at',
        'approved_at',
        'cancelled_at',
        'date_received',
        'created_by',
        'submitted_by',
        'approved_by',
        'cancelled_by',
    ];

    protected $casts = [
        'id' => 'string',
        'supplier_id' => 'string',
        'subtotal' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'order_date' => 'datetime',
        'request_ship_date' => 'date',
        'eta' => 'datetime',
        'submitted_at' => 'datetime',
        'approved_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'date_received' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = [
        'created_by_name',
        'submitted_by_name',
        'approved_by_name',
        'cancelled_by_name',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($purchaseOrder) {
            if (empty($purchaseOrder->id)) {
                $purchaseOrder->id = (string) Str::uuid();
            }

            if (empty($purchaseOrder->status)) {
                $purchaseOrder->status = 'DRAFT';
            }
        });
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class, 'supplier_id', 'id');
    }

    public function items()
    {
        return $this->hasMany(PurchaseOrderItem::class, 'purchase_order_id', 'id');
    }

    public function goodsReceipts()
    {
        return $this->hasMany(GoodsReceipt::class, 'purchase_order_id', 'id');
    }

    public function supplierBills()
    {
        return $this->hasMany(SupplierBill::class, 'purchase_order_id', 'id');
    }

    public function createdByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by', 'id');
    }

    public function approvedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by', 'id');
    }

    public function submittedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by', 'id');
    }

    public function cancelledByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by', 'id');
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

    public function getSubmittedByNameAttribute(): ?string
    {
        return $this->submittedByUser?->employee
            ? trim($this->submittedByUser->employee->first_name . ' ' . $this->submittedByUser->employee->last_name)
            : null;
    }

    public function getCancelledByNameAttribute(): ?string
    {
        return $this->cancelledByUser?->employee
            ? trim($this->cancelledByUser->employee->first_name . ' ' . $this->cancelledByUser->employee->last_name)
            : null;
    }
}
