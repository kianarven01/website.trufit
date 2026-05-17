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
        Schema::table('Main.ProductSuppliers', function (Blueprint $table) {
            $table->boolean('is_vat')->default(false);
            $table->decimal('vat_percent', 5, 2)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('Main.ProductSuppliers', function (Blueprint $table) {
            $table->dropColumn(['is_vat', 'vat_percent']);
        });
    }
};
