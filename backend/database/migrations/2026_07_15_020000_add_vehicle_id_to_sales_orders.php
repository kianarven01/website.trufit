<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('pgsql')->table('Main.SalesOrder', function (Blueprint $table) {
            if (!Schema::connection('pgsql')->hasColumn('Main.SalesOrder', 'vehicle_id')) {
                $table->bigInteger('vehicle_id')->nullable();
                $table->foreign('vehicle_id')->references('id')->on('Main.CustomerVehicles')->onDelete('set null');
            }
        });
    }

    public function down(): void
    {
        Schema::connection('pgsql')->table('Main.SalesOrder', function (Blueprint $table) {
            if (Schema::connection('pgsql')->hasColumn('Main.SalesOrder', 'vehicle_id')) {
                $table->dropForeign(['vehicle_id']);
                $table->dropColumn('vehicle_id');
            }
        });
    }
};
