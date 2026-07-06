<?php

namespace App\Domains\Product\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Domains\Product\Domain\Models\Category;
use App\Domains\Product\Domain\Models\Manufacturers;
use App\Domains\Product\Domain\Models\Unit;
use App\Domains\Supplier\Domain\Models\Supplier;
use App\Domains\Supplier\Domain\Models\ProductSupplier;
use App\Domains\Product\Domain\Models\ProductVehicleCompatibility;
use App\Domains\Product\Domain\Models\ProductEquivalent;
use App\Domains\Inventory\Domain\Models\Inventory;
use App\Domains\Product\Domain\Models\ProductEquivalentGroupItem;
use App\Domains\Product\Domain\Models\ProductEquivalentGroup;

class Product extends Model
{
    use SoftDeletes;

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
        'preferred_supplier_id',
    ];

    protected $casts = [
        'id' => 'string',
        'category_id' => 'integer',
        'manufacturer_id' => 'integer',
        'unit' => 'integer',
        'part_id' => 'integer',
        'is_oem' => 'boolean',
        'deleted_at' => 'datetime',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id', 'id');
    }

    public function manufacturer()
    {
        return $this->belongsTo(Manufacturers::class, 'manufacturer_id', 'id');
    }

    public function unitRelation()
    {
        return $this->belongsTo(Unit::class, 'unit', 'id');
    }

    public function vehicleCompatibilities()
    {
        return $this->hasMany(
            ProductVehicleCompatibility::class,
            'product_id',
            'id'
        );
    }

    public function productSuppliers()
    {
        return $this->hasMany(
            ProductSupplier::class,
            'product_id',
            'id'
        );
    }

    public function preferredSupplier()
    {
        return $this->belongsTo(
            ProductSupplier::class,
            'preferred_supplier_id',
            'id'
        );
    }

    public function resolvePreferredSupplier()
    {
        $preferred = $this->preferredSupplier;

        if ($preferred && $preferred->inventory && (int) $preferred->inventory->quantity_on_hand > 0) {
            return $preferred;
        }

        $productSuppliers = $this->relationLoaded('productSuppliers')
            ? $this->productSuppliers
            : $this->productSuppliers()->with('inventory')->get();

        return $productSuppliers
            ->filter(fn ($ps) => $ps->inventory && (int) $ps->inventory->quantity_on_hand > 0)
            ->sortByDesc(fn ($ps) => (int) $ps->inventory->quantity_on_hand)
            ->sortBy(fn ($ps) => (float) $ps->supplier_cost)
            ->first() ?? $preferred;
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

    public function inventoryRelation()
    {
        return $this->hasOne(Inventory::class, 'productID', 'id');
    }

    public function inventoryRows()
    {
        return $this->hasMany(Inventory::class, 'productID', 'id');
    }

    public function part()
    {
        return $this->belongsTo(Part::class, 'part_id', 'id');
    }

    public function equivalentGroupItems()
    {
        return $this->hasMany(
            ProductEquivalentGroupItem::class,
            'product_id',
            'id'
        );
    }

    public function equivalentGroups()
    {
        return $this->belongsToMany(
            ProductEquivalentGroup::class,
            'Main.ProductEquivalentGroupItems',
            'product_id',
            'group_id'
        )->withPivot(['id']);
    }
}
