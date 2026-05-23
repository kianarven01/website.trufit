<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('Main.ServicePricing', function (Blueprint $table) {
            $table->jsonb('vehicle_types')->nullable()->after('vehicle_size_name');
        });
    }

    public function down(): void
    {
        Schema::table('Main.ServicePricing', function (Blueprint $table) {
            $table->dropColumn('vehicle_types');
        });
    }
};
