<?php

namespace App\Domains\Estimate\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use App\Domains\Product\Domain\Models\ServiceType;
use App\Domains\Product\Domain\Models\Product;

class EstimateItem extends Model
{
    use HasUuids;

    protected $table = 'Main.EstimateItems';
    protected $primaryKey = 'id';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'estimate_id',
        'item_type',
        'product_id',
        'service_id',
        'quantity',
        'unit_price',
        'subtotal',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'created_at' => 'datetime',
    ];

    public function estimate()
    {
        return $this->belongsTo(Estimate::class, 'estimate_id', 'id');
    }

    public function service()
    {
        return $this->belongsTo(ServiceType::class, 'service_id', 'id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }
}
