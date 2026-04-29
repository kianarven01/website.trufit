<?php

namespace App\Domains\Product\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use App\Domains\Product\Domain\Models\Category;
use App\Domains\Product\Domain\Models\Manufacturers;
use App\Domains\Product\Domain\Models\Unit;
use App\Domains\Supplier\Domain\Models\Supplier;
use App\Domains\Product\Domain\Models\ProductVehicleCompatibility;

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

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

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
        return $this->hasMany(
            ProductVehicleCompatibility::class,
            'product_id'
        );
    }

    /**
     * Product ↔ Supplier (Many-to-Many via ProductSuppliers pivot)
     */
    public function suppliers()
    {
        return $this->belongsToMany(
            Supplier::class,
            'Main.ProductSuppliers',
            'product_id',
            'supplier_id'
        )
            ->withPivot([
                'supplier_cost'
            ]);
    }
}
