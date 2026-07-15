<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('pgsql')->table('Main.SalesOrder', function (Blueprint $table) {
            if (Schema::connection('pgsql')->hasColumn('Main.SalesOrder', 'StockAvailability')) {
                $table->string('StockAvailability')->nullable()->change();
            }
        });
    }

    public function down(): void
    {
        Schema::connection('pgsql')->table('Main.SalesOrder', function (Blueprint $table) {
            if (Schema::connection('pgsql')->hasColumn('Main.SalesOrder', 'StockAvailability')) {
                $table->string('StockAvailability')->nullable(false)->change();
            }
        });
    }
};
