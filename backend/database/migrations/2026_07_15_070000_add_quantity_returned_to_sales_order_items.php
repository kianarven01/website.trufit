<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('pgsql')->table('Main.SalesOrderItems', function (Blueprint $table) {
            if (!Schema::connection('pgsql')->hasColumn('Main.SalesOrderItems', 'quantity_returned')) {
                $table->integer('quantity_returned')->default(0);
            }
        });
    }

    public function down(): void
    {
        Schema::connection('pgsql')->table('Main.SalesOrderItems', function (Blueprint $table) {
            if (Schema::connection('pgsql')->hasColumn('Main.SalesOrderItems', 'quantity_returned')) {
                $table->dropColumn('quantity_returned');
            }
        });
    }
};
