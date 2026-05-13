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
        Schema::create('Main.ServicePricing', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('service_type_id');
            $table->string('vehicle_size_name');
            $table->decimal('price', 15, 2)->default(0);
            
            $table->foreign('service_type_id')->references('id')->on('Main.ServiceType')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('Main.ServicePricing');
    }
};
