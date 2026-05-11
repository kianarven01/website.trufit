<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Adds an 'origin' column to the Customers table to distinguish
     * between customers auto-created from appointments vs manually added.
     * Values: 'appointment' (auto-created lead) | 'manual' (explicitly created/curated)
     */
    public function up(): void
    {
        Schema::table('Main.Customers', function (Blueprint $table) {
            $table->string('origin')->default('appointment');
        });
    }

    public function down(): void
    {
        Schema::table('Main.Customers', function (Blueprint $table) {
            $table->dropColumn('origin');
        });
    }
};
