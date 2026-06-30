<?php

namespace App\Domains\Purchasing\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use App\Domains\Product\Domain\Models\Product;
use App\Domains\Supplier\Domain\Models\ProductSupplier;

class GoodsReceiptItem extends Model
{
    protected $table = 'Main.GoodsReceiptItems';
    protected $primaryKey = 'id';

    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = true;

    protected $fillable = [
        'id',
        'goods_receipt_id',
        'purchase_order_item_id',
        'product_id',
        'product_supplier_id',
        'quantity_received',
        'quantity_rejected',
        'notes',
    ];

    protected $casts = [
        'id' => 'string',
        'goods_receipt_id' => 'string',
        'purchase_order_item_id' => 'string',
        'product_id' => 'string',
        'product_supplier_id' => 'string',
        'quantity_received' => 'integer',
        'quantity_rejected' => 'integer',
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
        });
    }

    public function goodsReceipt()
    {
        return $this->belongsTo(GoodsReceipt::class, 'goods_receipt_id', 'id');
    }

    public function purchaseOrderItem()
    {
        return $this->belongsTo(PurchaseOrderItem::class, 'purchase_order_item_id', 'id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }

    public function productSupplier()
    {
        return $this->belongsTo(ProductSupplier::class, 'product_supplier_id', 'id');
    }
}
