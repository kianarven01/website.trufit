<?php

namespace App\Domains\Purchasing\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use App\Domains\Product\Domain\Models\Product;
use App\Domains\Supplier\Domain\Models\ProductSupplier;
use App\Domains\Inventory\Domain\Models\Inventory;

class StockMovement extends Model
{
    protected $table = 'Main.StockMovements';
    protected $primaryKey = 'id';

    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'inventory_id',
        'product_id',
        'product_supplier_id',
        'movement_type',
        'quantity',
        'reference_type',
        'reference_id',
        'notes',
        'created_by',
        'created_at',
    ];

    protected $casts = [
        'id' => 'string',
        'inventory_id' => 'string',
        'product_id' => 'string',
        'product_supplier_id' => 'string',
        'quantity' => 'integer',
        'created_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($movement) {
            if (empty($movement->id)) {
                $movement->id = (string) Str::uuid();
            }

            if (empty($movement->created_at)) {
                $movement->created_at = now();
            }
        });
    }

    public function inventory()
    {
        return $this->belongsTo(Inventory::class, 'inventory_id', 'id');
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
