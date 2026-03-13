<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('Main.Employees', function (Blueprint $table) {
            $table->timestamp('email_verification_expires_at')->nullable()->after('verification_code');
            $table->timestamp('phone_verification_expires_at')->nullable()->after('phone_verification_code');
            $table->timestamp('password_reset_expires_at')->nullable()->after('password_reset_code');
        });
    }

    public function down(): void
    {
        Schema::table('Main.Employees', function (Blueprint $table) {
            $table->dropColumn([
                'email_verification_expires_at',
                'phone_verification_expires_at',
                'password_reset_expires_at'
            ]);
        });
    }
};