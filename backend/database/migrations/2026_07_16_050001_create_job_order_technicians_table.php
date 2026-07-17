<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('pgsql')->create('Main.JobOrderTechnicians', function (Blueprint $table) {
            $table->id();
            $table->uuid('JobOrderID');
            $table->bigInteger('employee_id');
            $table->text('role')->default('PRIMARY');
            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamp('removed_at')->nullable();
            $table->integer('accumulated_seconds')->default(0);

            $table->foreign('JobOrderID')
                ->references('id')
                ->on('Main.JobOrder')
                ->onDelete('cascade');
            $table->foreign('employee_id')
                ->references('id')
                ->on('Main.Employees');
        });
    }

    public function down(): void
    {
        Schema::connection('pgsql')->dropIfExists('Main.JobOrderTechnicians');
    }
};
