<?php

namespace App\Domains\SalesOrder\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Domains\Product\Domain\Models\Product;

class SalesOrderItem extends Model
{
    use HasUuids;

    protected $table = 'SalesOrderItems';
    protected $primaryKey = 'id';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'SalesOrderID',
        'ProductID',
        'quantity',
        'UnitPrice',
        'SubTotal',
        'CostAtSale',
        'TaxAtSale',
        'needs_ordering',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'UnitPrice' => 'decimal:2',
        'SubTotal' => 'decimal:2',
        'CostAtSale' => 'decimal:2',
        'needs_ordering' => 'boolean',
    ];

    public function salesOrder()
    {
        return $this->belongsTo(SalesOrder::class, 'SalesOrderID', 'id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'ProductID', 'id');
    }
}
