<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('Main.SupplierBills', function (Blueprint $table) {
            $table->string('voided_by', 36)->nullable()->after('paid_by');
            $table->timestamp('voided_at')->nullable()->after('paid_at');
        });
    }

    public function down(): void
    {
        Schema::table('Main.SupplierBills', function (Blueprint $table) {
            $table->dropColumn(['voided_by', 'voided_at']);
        });
    }
};
