<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('SalesOrderItems', function (Blueprint $table) {
            $table->integer('issued_quantity')->default(0)->after('quantity_returned');
        });

        // Backfill: set issued_quantity = quantity for items already issued
        DB::connection('pgsql')->table('SalesOrderItems')
            ->where('is_issued', true)
            ->update(['issued_quantity' => DB::raw('quantity')]);
    }

    public function down(): void
    {
        Schema::table('SalesOrderItems', function (Blueprint $table) {
            $table->dropColumn('issued_quantity');
        });
    }
};
