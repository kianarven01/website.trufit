<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('pgsql')->table('Main.SalesOrderItems', function (Blueprint $table) {
            if (!Schema::connection('pgsql')->hasColumn('Main.SalesOrderItems', 'needs_ordering')) {
                $table->boolean('needs_ordering')->default(false);
            }
        });
    }

    public function down(): void
    {
        Schema::connection('pgsql')->table('Main.SalesOrderItems', function (Blueprint $table) {
            if (Schema::connection('pgsql')->hasColumn('Main.SalesOrderItems', 'needs_ordering')) {
                $table->dropColumn('needs_ordering');
            }
        });
    }
};
