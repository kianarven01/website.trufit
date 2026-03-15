<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Create the new Security table
        Schema::create('Main.EmployeeSecurity', function (Blueprint $table) {
            $table->integer('employee_id')->primary();
            
            // Email Verification
            $table->timestamp('email_verified_at')->nullable();
            $table->string('email_verification_code', 6)->nullable();
            $table->timestamp('email_verification_expires_at')->nullable();

            // Phone Verification
            $table->timestamp('phone_verified_at')->nullable();
            $table->string('phone_verification_code', 6)->nullable();
            $table->timestamp('phone_verification_expires_at')->nullable();

            // Password Recovery
            $table->string('password_reset_code', 6)->nullable();
            $table->timestamp('password_reset_expires_at')->nullable();

            // Adaptive Auth (Throttling)
            $table->integer('failed_login_attempts')->default(0);
            $table->timestamp('lockout_until')->nullable();

            $table->foreign('employee_id')->references('id')->on('Main.Employees')->onDelete('cascade');
        });

        // 2. Clean up the Employees table
        Schema::table('Main.Employees', function (Blueprint $table) {
            $table->dropColumn([
                'email_verified_at',
                'verification_code',
                'email_verification_expires_at',
                'phone_verified_at',
                'phone_verification_code',
                'phone_verification_expires_at',
                'password_reset_code',
                'password_reset_expires_at',
                'failed_login_attempts',
                'lockout_until'
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Main.EmployeeSecurity');
        // Note: Adding columns back to Employees would go here if needed for rollback
    }
};