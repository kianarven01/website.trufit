<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('pgsql')->table('Main.SalesOrderItems', function ($table) {
            if (!Schema::connection('pgsql')->hasColumn('Main.SalesOrderItems', 'is_tentative')) {
                $table->boolean('is_tentative')->default(false)->after('needs_ordering');
            }
        });
    }

    public function down(): void
    {
        Schema::connection('pgsql')->table('Main.SalesOrderItems', function ($table) {
            if (Schema::connection('pgsql')->hasColumn('Main.SalesOrderItems', 'is_tentative')) {
                $table->dropColumn('is_tentative');
            }
        });
    }
};
