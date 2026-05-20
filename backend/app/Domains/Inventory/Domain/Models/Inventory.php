<?php

namespace App\Domains\Inventory\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use App\Domains\Product\Domain\Models\Product;

class Inventory extends Model
{
    public $timestamps = false;

    protected $table = 'Main.Inventory';
    protected $primaryKey = 'id';

    protected $fillable = [
        'productID',
        'quantity_on_hand',
        'reorder_level',
        'sell_price',
        'location_id',
        'reserved_quantity',
        'reorder_qty',
    ];

    protected $casts = [
        'id' => 'integer',
        'productID' => 'string',
        'quantity_on_hand' => 'integer',
        'reorder_level' => 'integer',
        'sell_price' => 'float',
        'location_id' => 'string',
        'reserved_quantity' => 'integer',
        'reorder_qty' => 'integer',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'productID', 'id');
    }
}
