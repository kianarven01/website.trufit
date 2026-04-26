<?php

namespace App\Domains\Product\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use App\Domains\Product\Domain\Models\ProductSupplier;

class Product extends Model
{
    public $timestamps = false;

    protected $table = 'Main.Products';
    protected $primaryKey = 'id';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'SKU',
        'description',
        'image_path',
        'category_id',
        'barcode',
        'part_number',
        'is_oem',
        'oem_reference_number',
        'unit',
        'part_id',
        'manufacturer_id',
    ];

    protected $casts = [
        
        'is_oem' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function manufacturer()
    {
        return $this->belongsTo(Manufacturers::class, 'manufacturer_id');
    }

    public function unitRelation()
    {
        return $this->belongsTo(Unit::class, 'unit');
    }

    public function vehicleCompatibilities()
    {
        return $this->hasMany(ProductVehicleCompatibility::class, 'product_id');
    }

    public function suppliers()
    {
        return $this->hasMany(ProductSupplier::class, 'product_id', 'id');
    }
}