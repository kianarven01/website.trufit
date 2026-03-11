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
        // Expand Employees table columns to TEXT
        Schema::table('Main.Employees', function (Blueprint $table) {
            $table->text('phone')->nullable()->change();
            $table->text('address')->nullable()->change();
        });

        // Expand RegistrationKeys table columns to TEXT
        Schema::table('Main.RegistrationKeys', function (Blueprint $table) {
            $table->text('phone')->nullable()->change();
            $table->text('address')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverting to varchar(255) as a safe baseline for rollback
        Schema::table('Main.Employees', function (Blueprint $table) {
            $table->string('phone', 255)->nullable()->change();
            $table->string('address', 255)->nullable()->change();
        });

        Schema::table('Main.RegistrationKeys', function (Blueprint $table) {
            $table->string('phone', 255)->nullable()->change();
            $table->string('address', 255)->nullable()->change();
        });
    }
};