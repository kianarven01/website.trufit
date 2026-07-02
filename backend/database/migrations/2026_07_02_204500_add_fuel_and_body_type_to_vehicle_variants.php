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
        Schema::table('Main.VehicleVariants', function (Blueprint $table) {
            $table->string('fuel_type', 50)->nullable();
            $table->string('body_type', 50)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('Main.VehicleVariants', function (Blueprint $table) {
            $table->dropColumn(['fuel_type', 'body_type']);
        });
    }
};
