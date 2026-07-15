<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('pgsql')->table('Main.Products', function (Blueprint $table) {
            $table->dropColumn(['is_oem', 'oem_reference_number']);
        });
    }

    public function down(): void
    {
        Schema::connection('pgsql')->table('Main.Products', function (Blueprint $table) {
            $table->boolean('is_oem')->default(false);
            $table->string('oem_reference_number')->nullable();
        });
    }
};
