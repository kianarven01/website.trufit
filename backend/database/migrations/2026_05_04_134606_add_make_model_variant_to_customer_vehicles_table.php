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
            if (!Schema::hasColumn('Main.CustomerVehicles', 'make')) {
                $table->string('make')->nullable();
            }
            if (!Schema::hasColumn('Main.CustomerVehicles', 'model')) {
                $table->string('model')->nullable();
            }
            if (!Schema::hasColumn('Main.CustomerVehicles', 'variant')) {
                $table->string('variant')->nullable();
            }
            if (!Schema::hasColumn('Main.CustomerVehicles', 'year_model')) {
                $table->string('year_model')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('Main.CustomerVehicles', function (Blueprint $table) {
            $table->dropColumn(['make', 'model', 'variant', 'year_model']);
        });
    }
};
