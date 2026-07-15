<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('pgsql')->table('Main.SalesOrder', function (Blueprint $table) {
            // Drop StockAvailability if it exists
            if (Schema::connection('pgsql')->hasColumn('Main.SalesOrder', 'StockAvailability')) {
                $table->dropColumn('StockAvailability');
            }

            // Drop JobOrderID if it exists
            if (Schema::connection('pgsql')->hasColumn('Main.SalesOrder', 'JobOrderID')) {
                $table->dropColumn('JobOrderID');
            }

            // Drop job_order_id if it exists
            if (Schema::connection('pgsql')->hasColumn('Main.SalesOrder', 'job_order_id')) {
                $table->dropColumn('job_order_id');
            }
        });
    }

    public function down(): void
    {
        Schema::connection('pgsql')->table('Main.SalesOrder', function (Blueprint $table) {
            // Restore legacy/unused columns in down()
            $table->string('StockAvailability')->nullable();
            $table->decimal('JobOrderID', 15, 0)->nullable();
            $table->uuid('job_order_id')->nullable();
        });
    }
};
