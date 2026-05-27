<?php

namespace App\Domains\Product\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use App\Domains\Product\Domain\Models\Category;
use App\Domains\Product\Domain\Models\Manufacturers;
use App\Domains\Product\Domain\Models\Unit;
use App\Domains\Supplier\Domain\Models\Supplier;
use App\Domains\Supplier\Domain\Models\ProductSupplier;
use App\Domains\Product\Domain\Models\ProductVehicleCompatibility;
use App\Domains\Product\Domain\Models\ProductEquivalent;
use App\Domains\Inventory\Domain\Models\Inventory;

class Product extends Model
{
    public $timestamps = false;

    protected $table = 'Main.Products';
    protected $primaryKey = 'id';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
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
        'id' => 'string',
        'category_id' => 'integer',
        'manufacturer_id' => 'integer',
        'unit' => 'integer',
        'part_id' => 'integer',
        'is_oem' => 'boolean',
    ];
    // Category relationship
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'id');
    }
    // Manufacturer relationship
    public function manufacturer()
    {
        return $this->belongsTo(Manufacturers::class, 'manufacturer_id', 'id');
    }
    // Unit relationship
    public function unitRelation()
    {
        return $this->belongsTo(Unit::class, 'unit', 'id');
    }
    // Vehicle compatibility relationships
    public function vehicleCompatibilities()
    {
        return $this->hasMany(
            ProductVehicleCompatibility::class,
            'product_id',
            'id'
        );
    }
    // Supplier relationships
    public function productSuppliers()
    {
        return $this->hasMany(
            ProductSupplier::class,
            'product_id',
            'id'
        );
    }

    public function suppliers()
    {
        return $this->belongsToMany(
            Supplier::class,
            'Main.ProductSuppliers',
            'product_id',
            'supplier_id'
        )->withPivot([
            'id',
            'supplier_cost',
        ]);
    }
    // Equivalents relationships
    public function equivalentLinks()
    {
        return $this->hasMany(
            ProductEquivalent::class,
            'base_product_id',
            'id'
        );
    }

    public function equivalentToLinks()
    {
        return $this->hasMany(
            ProductEquivalent::class,
            'equivalent_product_id',
            'id'
        );
    }

    public function equivalentProducts()
    {
        return $this->belongsToMany(
            Product::class,
            'Main.ProductEquivalents',
            'base_product_id',
            'equivalent_product_id'
        )->withPivot([
            'id',
        ]);
    }

    public function equivalentToProducts()
    {
        return $this->belongsToMany(
            Product::class,
            'Main.ProductEquivalents',
            'equivalent_product_id',
            'base_product_id'
        )->withPivot([
            'id',
        ]);
    }
    // Inventory relationships
    public function inventoryRelation()
    {
        return $this->hasOne(Inventory::class, 'productID', 'id');
    }

    public function inventoryRows()
    {
        return $this->hasMany(\App\Domains\Inventory\Domain\Models\Inventory::class, 'productID', 'id');
    }
    // Part relationship
    public function part()
    {
        return $this->belongsTo(Part::class, 'part_id', 'id');
    }

    
}