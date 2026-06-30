<?php

namespace App\Domains\Purchasing\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use App\Domains\Supplier\Domain\Models\Supplier;

class PurchaseOrder extends Model
{
    protected $table = 'Main.PurchaseOrders';
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
}
