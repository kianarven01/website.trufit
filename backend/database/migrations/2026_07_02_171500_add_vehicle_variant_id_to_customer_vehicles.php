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
        Schema::table('Main.CustomerVehicles', function (Blueprint $table) {
            $table->unsignedBigInteger('vehicle_variant_id')->nullable();
            $table->foreign('vehicle_variant_id', 'fk_customer_vehicles_variant_id')
                  ->references('id')
                  ->on('Main.VehicleVariants')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('Main.CustomerVehicles', function (Blueprint $table) {
            $table->dropForeign('fk_customer_vehicles_variant_id');
            $table->dropColumn('vehicle_variant_id');
        });
    }
};
