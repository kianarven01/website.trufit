<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('pgsql')->table('Main.SalesOrder', function (Blueprint $table) {
            if (!Schema::connection('pgsql')->hasColumn('Main.SalesOrder', 'submitted_by')) {
                $table->bigInteger('submitted_by')->nullable();
                $table->foreign('submitted_by')->references('id')->on('UserCredentials')->onDelete('set null');
            }
            if (!Schema::connection('pgsql')->hasColumn('Main.SalesOrder', 'submitted_at')) {
                $table->timestamp('submitted_at')->nullable();
            }
            if (!Schema::connection('pgsql')->hasColumn('Main.SalesOrder', 'cancelled_by')) {
                $table->bigInteger('cancelled_by')->nullable();
                $table->foreign('cancelled_by')->references('id')->on('UserCredentials')->onDelete('set null');
            }
            if (!Schema::connection('pgsql')->hasColumn('Main.SalesOrder', 'cancelled_at')) {
                $table->timestamp('cancelled_at')->nullable();
            }
            if (!Schema::connection('pgsql')->hasColumn('Main.SalesOrder', 'completed_at')) {
                $table->timestamp('completed_at')->nullable();
            }
            if (!Schema::connection('pgsql')->hasColumn('Main.SalesOrder', 'deleted_at')) {
                $table->softDeletes();
            }
        });
    }

    public function down(): void
    {
        Schema::connection('pgsql')->table('Main.SalesOrder', function (Blueprint $table) {
            $table->dropForeign(['submitted_by']);
            $table->dropColumn('submitted_by');
            $table->dropColumn('submitted_at');
            $table->dropForeign(['cancelled_by']);
            $table->dropColumn('cancelled_by');
            $table->dropColumn('cancelled_at');
            $table->dropColumn('completed_at');
            $table->dropColumn('deleted_at');
        });
    }
};
