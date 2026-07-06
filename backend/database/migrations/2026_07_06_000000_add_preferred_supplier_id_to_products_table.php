<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('Main.Products', function (Blueprint $table) {
            $table->uuid('preferred_supplier_id')->nullable()->after('manufacturer_id');

            $table->foreign('preferred_supplier_id')
                ->references('id')
                ->on('Main.ProductSuppliers')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('Main.Products', function (Blueprint $table) {
            $table->dropForeign(['preferred_supplier_id']);
            $table->dropColumn('preferred_supplier_id');
        });
    }
};
