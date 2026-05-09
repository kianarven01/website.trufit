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
        Schema::create('Main.Appointments', function (Blueprint $table) {
            $table->id();
            $table->string('appointment_code')->unique();
            $table->unsignedBigInteger('customerID');
            $table->string('plate_number');
            $table->timestamp('appointment_datetime');
            $table->string('status')->default('for approval'); // for approval, confirmed, cancelled
            $table->json('services')->nullable(); // Store the array of services (including custom ones)
            $table->text('notes')->nullable();
            $table->timestamps();

            // Foreign keys
            $table->foreign('customerID')->references('customer_id')->on('Main.Customers')->onDelete('cascade');
            $table->foreign('plate_number')->references('plate_number')->on('Main.CustomerVehicles')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('Main.Appointments');
    }
};
