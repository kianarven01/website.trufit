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
        'is_issued',
        'issued_at',
        'issued_by',
        'quantity_returned',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'quantity_returned' => 'integer',
        'UnitPrice' => 'decimal:2',
        'SubTotal' => 'decimal:2',
        'CostAtSale' => 'decimal:2',
        'needs_ordering' => 'boolean',
        'is_issued' => 'boolean',
        'issued_at' => 'datetime',
    ];

    public function salesOrder()
    {
        return $this->belongsTo(SalesOrder::class, 'SalesOrderID', 'id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'ProductID', 'id');
    }

    public function productSupplier()
    {
        return $this->hasOne(\App\Domains\Supplier\Domain\Models\ProductSupplier::class, 'product_id', 'ProductID');
    }

    public function getTaxCodeAttribute(): ?string
    {
        if ($this->TaxAtSale) {
            return $this->TaxAtSale === 'NON_VAT' ? 'Non-VAT' : 'VAT';
        }
        $ps = $this->productSupplier;
        if ($ps) {
            return $ps->is_vat ? 'VAT' : 'Non-VAT';
        }
        return null;
    }
}
