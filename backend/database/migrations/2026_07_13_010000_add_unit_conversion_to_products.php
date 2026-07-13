<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('pgsql')->table('Main.Products', function (Blueprint $table) {
            $table->integer('conversion_factor')->default(1)->after('unit');
            $table->integer('base_unit_id')->nullable()->after('conversion_factor');
        });
    }

    public function down(): void
    {
        Schema::connection('pgsql')->table('Main.Products', function (Blueprint $table) {
            $table->dropColumn(['conversion_factor', 'base_unit_id']);
        });
    }
};
