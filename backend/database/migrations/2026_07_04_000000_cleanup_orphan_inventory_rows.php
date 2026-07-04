<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function () {
            // Delete orphan inventory rows where a supplier-specific row exists for the same product+location.
            // These NULL product_supplier_id rows come from the seed migration and are superseded
            // by the supplier-specific rows created by LinkProductToSupplier.
            DB::table('Main.Inventory as orphan')
                ->whereNull('orphan.product_supplier_id')
                ->whereExists(function ($query) {
                    $query->select(DB::raw(1))
                        ->from('Main.Inventory as linked')
                        ->whereColumn('linked.productID', 'orphan.productID')
                        ->whereColumn('linked.location_id', 'orphan.location_id')
                        ->whereNotNull('linked.product_supplier_id');
                })
                ->delete();
        });
    }

    public function down(): void
    {
        // Nothing to reverse — the orphan rows are permanently removed.
    }
};
