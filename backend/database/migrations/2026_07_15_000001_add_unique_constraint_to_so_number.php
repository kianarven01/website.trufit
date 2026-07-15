<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('pgsql')->table('Main.SalesOrder', function (Blueprint $table) {
            $table->unique('so_number');
        });
    }

    public function down(): void
    {
        Schema::connection('pgsql')->table('Main.SalesOrder', function (Blueprint $table) {
            $table->dropUnique(['so_number']);
        });
    }
};
