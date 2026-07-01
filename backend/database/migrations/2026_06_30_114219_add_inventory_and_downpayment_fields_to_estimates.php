<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add needs_ordering flag and custom_name to estimate items
        Schema::table('Main.EstimateItems', function (Blueprint $table) {
            $table->boolean('needs_ordering')->default(false);
            $table->string('custom_name', 255)->nullable();  // For free-text custom items (not in product catalog)
        });

        // Add downpayment fields to estimates
        Schema::table('Main.Estimates', function (Blueprint $table) {
            $table->decimal('downpayment_amount', 12, 2)->default(0.00);
            $table->string('payment_method', 50)->nullable();
            $table->string('payment_reference', 100)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('Main.EstimateItems', function (Blueprint $table) {
            $table->dropColumn(['needs_ordering', 'custom_name']);
        });

        Schema::table('Main.Estimates', function (Blueprint $table) {
            $table->dropColumn(['downpayment_amount', 'payment_method', 'payment_reference']);
        });
    }
};
