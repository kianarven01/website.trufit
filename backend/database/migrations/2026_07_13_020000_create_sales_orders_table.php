<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('Main.SalesOrder', function (Blueprint $table) {
            // Make JobOrderID nullable since Sales Order is created before Job Order in the flow
            $table->decimal('JobOrderID', 15, 0)->nullable()->change();

            if (!Schema::hasColumn('Main.SalesOrder', 'estimate_id')) {
                $table->uuid('estimate_id')->nullable();
                $table->foreign('estimate_id')->references('id')->on('Main.Estimates')->onDelete('set null');
            }
            if (!Schema::hasColumn('Main.SalesOrder', 'vehicle_id')) {
                $table->bigInteger('vehicle_id')->nullable();
                $table->foreign('vehicle_id')->references('id')->on('Main.CustomerVehicles')->onDelete('set null');
            }
            if (!Schema::hasColumn('Main.SalesOrder', 'approved_by')) {
                $table->integer('approved_by')->nullable();
                $table->foreign('approved_by')->references('id')->on('Main.Employees')->onDelete('set null');
            }
        });

        if (!Schema::hasTable('Main.SalesOrderItems')) {
            Schema::create('Main.SalesOrderItems', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->uuid('SalesOrderID');
                $table->uuid('ProductID');
                $table->integer('quantity');
                $table->decimal('UnitPrice', 15, 2);
                $table->decimal('SubTotal', 15, 2);
                $table->decimal('CostAtSale', 15, 2)->default(0.00);
                $table->string('TaxAtSale')->nullable();
                $table->boolean('needs_ordering')->default(false);

                $table->foreign('SalesOrderID')->references('id')->on('Main.SalesOrder')->onDelete('cascade');
                $table->foreign('ProductID')->references('id')->on('Main.Products')->onDelete('restrict');
            });
        }
    }

    public function down(): void
    {
        Schema::table('Main.SalesOrder', function (Blueprint $table) {
            $table->decimal('JobOrderID', 15, 0)->nullable(false)->change();

            $table->dropForeign(['estimate_id']);
            $table->dropColumn('estimate_id');
            $table->dropForeign(['vehicle_id']);
            $table->dropColumn('vehicle_id');
            $table->dropForeign(['approved_by']);
            $table->dropColumn('approved_by');
        });

        Schema::dropIfExists('Main.SalesOrderItems');
    }
};
