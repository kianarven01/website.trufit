<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('SalesOrder', function (Blueprint $table) {
            $table->integer('mileage')->nullable()->after('vehicle_id');
        });
    }

    public function down(): void
    {
        Schema::table('SalesOrder', function (Blueprint $table) {
            $table->dropColumn('mileage');
        });
    }
};
