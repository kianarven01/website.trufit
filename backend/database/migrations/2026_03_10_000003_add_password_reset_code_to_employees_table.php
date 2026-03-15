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
        Schema::table('Main.Employees', function (Blueprint $table) {
            $table->string('password_reset_code', 6)->nullable()->after('phone_verification_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('Main.Employees', function (Blueprint $table) {
            $table->dropColumn('password_reset_code');
        });
    }
};