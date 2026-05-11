<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('Main.ServiceType', function (Blueprint $table) {
            $table->text('description')->nullable();
            $table->string('pricing_type')->default('fixed'); // fixed, hourly
            $table->integer('duration')->default(0); // in minutes
        });
    }

    public function down(): void
    {
        Schema::table('Main.ServiceType', function (Blueprint $table) {
            $table->dropColumn(['description', 'pricing_type', 'duration']);
        });
    }
};
