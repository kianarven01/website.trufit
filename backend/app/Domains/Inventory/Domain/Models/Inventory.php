<?php

namespace App\Domains\Inventory\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasEvents;
use App\Domains\Product\Domain\Models\Product;
use App\Domains\Supplier\Domain\Models\ProductSupplier;
use App\Domains\Inventory\Domain\Models\StockLocation;

class Inventory extends Model
{
    use HasEvents;

    protected static function boot(): void
    {
        parent::boot();
        static::observe(\App\Domains\Inventory\Observers\InventoryObserver::class);
    }
    public $timestamps = false;

    protected $table = 'Inventory';

    protected $primaryKey = 'id';

    protected $fillable = [
        'productID',
        'product_supplier_id',
        'quantity_on_hand',
        'reorder_level',
        'sell_price',
        'location_id',
        'bin_id',
        'reserved_quantity',
        'reorder_qty',
    ];

    protected $casts = [
        'id' => 'integer',
        'productID' => 'string',
        'product_supplier_id' => 'string',
        'quantity_on_hand' => 'integer',
        'reorder_level' => 'integer',
        'sell_price' => 'float',
        'location_id' => 'string',
        'bin_id' => 'string',
        'reserved_quantity' => 'integer',
        'reorder_qty' => 'integer',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'productID', 'id');
    }

    public function productSupplier()
    {
        return $this->belongsTo(ProductSupplier::class, 'product_supplier_id', 'id');
    }

    public function location()
    {
        return $this->belongsTo(StockLocation::class, 'location_id', 'id');
    }

    public function bin()
    {
        return $this->belongsTo(BinLocation::class, 'bin_id', 'id');
    }
}