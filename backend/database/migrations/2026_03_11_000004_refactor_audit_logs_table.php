<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // We drop and recreate to ensure clean ERP-grade structure
        Schema::dropIfExists('Main.AuditLogs');

        Schema::create('Main.AuditLogs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('employee_id')->nullable(); // Who did it? Nullable for system actions
            $table->string('event_type'); // e.g., 'SECURITY', 'DATA_CHANGE', 'AUTH'
            $table->string('action');     // e.g., 'PASSWORD_RESET', 'EMPLOYEE_CREATED'
            
            // Polmorphic reference to the target
            $table->string('auditable_type')->nullable(); 
            $table->string('auditable_id')->nullable();   // String to support both BIGINT and UUID
            
            $table->jsonb('old_values')->nullable();
            $table->jsonb('new_values')->nullable();
            
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('employee_id')->references('id')->on('Main.Employees')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Main.AuditLogs');
    }
};