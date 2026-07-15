<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('pgsql')->table('Main.SalesOrderItems', function (Blueprint $table) {
            if (!Schema::connection('pgsql')->hasColumn('Main.SalesOrderItems', 'is_issued')) {
                $table->boolean('is_issued')->default(false);
            }
            if (!Schema::connection('pgsql')->hasColumn('Main.SalesOrderItems', 'issued_at')) {
                $table->timestamp('issued_at')->nullable();
            }
            if (!Schema::connection('pgsql')->hasColumn('Main.SalesOrderItems', 'issued_by')) {
                $table->bigInteger('issued_by')->nullable();
                $table->foreign('issued_by')->references('id')->on('UserCredentials')->onDelete('set null');
            }
        });

        Schema::connection('pgsql')->table('Main.SalesOrder', function (Blueprint $table) {
            if (!Schema::connection('pgsql')->hasColumn('Main.SalesOrder', 'approved_at')) {
                $table->timestamp('approved_at')->nullable();
            }
            if (!Schema::connection('pgsql')->hasColumn('Main.SalesOrder', 'started_by')) {
                $table->bigInteger('started_by')->nullable();
                $table->foreign('started_by')->references('id')->on('UserCredentials')->onDelete('set null');
            }
            if (!Schema::connection('pgsql')->hasColumn('Main.SalesOrder', 'started_at')) {
                $table->timestamp('started_at')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::connection('pgsql')->table('Main.SalesOrderItems', function (Blueprint $table) {
            $table->dropForeign(['issued_by']);
            $table->dropColumn(['is_issued', 'issued_at', 'issued_by']);
        });

        Schema::connection('pgsql')->table('Main.SalesOrder', function (Blueprint $table) {
            $table->dropForeign(['started_by']);
            $table->dropColumn(['approved_at', 'started_by', 'started_at']);
        });
    }
};
