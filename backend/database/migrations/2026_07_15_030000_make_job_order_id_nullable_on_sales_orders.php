<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('pgsql')->table('Main.SalesOrder', function (Blueprint $table) {
            $table->decimal('JobOrderID', 15, 0)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::connection('pgsql')->table('Main.SalesOrder', function (Blueprint $table) {
            $table->decimal('JobOrderID', 15, 0)->nullable(false)->change();
        });
    }
};
