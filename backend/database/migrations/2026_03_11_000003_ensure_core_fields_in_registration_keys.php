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
        Schema::table('Main.RegistrationKeys', function (Blueprint $table) {
            if (!Schema::hasColumn('Main.RegistrationKeys', 'employee_name')) {
                $table->string('employee_name')->nullable()->after('key_code');
            }
            if (!Schema::hasColumn('Main.RegistrationKeys', 'email')) {
                $table->string('email')->nullable()->after('employee_name');
            }
            if (!Schema::hasColumn('Main.RegistrationKeys', 'position')) {
                $table->string('position')->nullable()->after('expires_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('Main.RegistrationKeys', function (Blueprint $table) {
            $table->dropColumn(['employee_name', 'email', 'position']);
        });
    }
};