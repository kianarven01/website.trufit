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
        Schema::table('GoodsReceiptItems', function (Blueprint $table) {
            $table->integer('quantity_promo')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('GoodsReceiptItems', function (Blueprint $table) {
            $table->dropColumn('quantity_promo');
        });
    }
};
