<?php

namespace App\Domains\Purchasing\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class GoodsReceipt extends Model
{
    protected $table = 'Main.GoodsReceipts';
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
}
