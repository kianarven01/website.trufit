<?php

namespace App\Domains\Purchasing\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use App\Domains\Product\Domain\Models\Product;
use App\Domains\Supplier\Domain\Models\ProductSupplier;

class PurchaseOrderItem extends Model
{
    protected $table = 'PurchaseOrderItems';
    protected $primaryKey = 'id';

    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = true;

    protected $fillable = [
        'id',
        'purchase_order_id',
        'product_id',
        'product_supplier_id',
        'quantity_ordered',
        'unit_cost',
        'line_total',
        'notes',
        'tax_type',
    ];

    protected $casts = [
        'id' => 'string',
        'purchase_order_id' => 'string',
        'product_id' => 'string',
        'product_supplier_id' => 'string',
        'quantity_ordered' => 'integer',
        'unit_cost' => 'decimal:2',
        'line_total' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($item) {
            if (empty($item->id)) {
                $item->id = (string) Str::uuid();
            }

            $item->line_total = (float) $item->quantity_ordered * (float) $item->unit_cost;
        });

        static::updating(function ($item) {
            $item->line_total = (float) $item->quantity_ordered * (float) $item->unit_cost;
        });
    }

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class, 'purchase_order_id', 'id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }

    public function productSupplier()
    {
        return $this->belongsTo(ProductSupplier::class, 'product_supplier_id', 'id');
    }

    public function receiptItems()
    {
        return $this->hasMany(GoodsReceiptItem::class, 'purchase_order_item_id', 'id');
    }
}
