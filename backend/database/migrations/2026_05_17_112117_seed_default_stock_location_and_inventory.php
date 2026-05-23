<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        \Illuminate\Support\Facades\DB::transaction(function () {
            // 1. Create default stock location if it doesn't exist
            $locationId = 'd3b07384-d113-4ec6-a55d-752007414777';
            $exists = \Illuminate\Support\Facades\DB::table('Main.StockLocations')->where('id', $locationId)->exists();
            if (!$exists) {
                \Illuminate\Support\Facades\DB::table('Main.StockLocations')->insert([
                    'id' => $locationId,
                    'code' => 'MWH-01',
                    'name' => 'Main Warehouse',
                    'description' => 'Default storage location for all vehicle parts and products.',
                    'is_active' => true,
                    'created_at' => now(),
                ]);
            }

            // 2. Ensure all products have an inventory entry
            $products = \Illuminate\Support\Facades\DB::table('Main.Products')->get();
            foreach ($products as $product) {
                $hasInventory = \Illuminate\Support\Facades\DB::table('Main.Inventory')->where('productID', $product->id)->exists();
                if (!$hasInventory) {
                    \Illuminate\Support\Facades\DB::table('Main.Inventory')->insert([
                        'productID' => $product->id,
                        'quantity_on_hand' => 15, // Let's give them some initial stock to make it functional!
                        'sell_price' => 750.00,  // Give it a default selling price so it's not 0!
                        'location_id' => $locationId,
                        'reserved_quantity' => 0,
                        'reorder_level' => 5,
                        'reorder_qty' => 10,
                    ]);
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \Illuminate\Support\Facades\DB::transaction(function () {
            $locationId = 'd3b07384-d113-4ec6-a55d-752007414777';
            \Illuminate\Support\Facades\DB::table('Main.Inventory')->where('location_id', $locationId)->delete();
            \Illuminate\Support\Facades\DB::table('Main.StockLocations')->where('id', $locationId)->delete();
        });
    }
};
