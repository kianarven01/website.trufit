<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('Main.BillingStatement', function (Blueprint $table) {
            $table->unsignedBigInteger('created_by')->nullable()->after('notes');
            $table->foreign('created_by')->references('id')->on('UserCredentials')->onDelete('set null');
        });

        Schema::table('Main.Payment', function (Blueprint $table) {
            $table->unsignedBigInteger('recorded_by')->nullable()->after('Type');
            $table->foreign('recorded_by')->references('id')->on('UserCredentials')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('Main.BillingStatement', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropColumn('created_by');
        });

        Schema::table('Main.Payment', function (Blueprint $table) {
            $table->dropForeign(['recorded_by']);
            $table->dropColumn('recorded_by');
        });
    }
};
