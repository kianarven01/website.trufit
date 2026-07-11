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
        Schema::table('PurchaseOrders', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('GoodsReceipts', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('SupplierBills', function (Blueprint $table) {
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('PurchaseOrders', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('GoodsReceipts', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('SupplierBills', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
