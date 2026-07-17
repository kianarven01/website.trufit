<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('pgsql')->table('Main.BillingStatement', function (Blueprint $table) {
            $table->string('bill_number')->nullable()->unique();
            $table->unsignedBigInteger('vehicle_id')->nullable();
            $table->decimal('tax', 15, 2)->default(0);
            $table->text('notes')->nullable();

            $table->foreign('vehicle_id')
                ->references('id')
                ->on('CustomerVehicles')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::connection('pgsql')->table('Main.BillingStatement', function (Blueprint $table) {
            $table->dropForeign(['vehicle_id']);
            $table->dropColumn(['bill_number', 'vehicle_id', 'tax', 'notes']);
        });
    }
};
