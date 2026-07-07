<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Eloquent\Model;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::connection('pgsql')->hasColumn('Main.Category', 'is_spol')) {
            Schema::connection('pgsql')->table('Main.Category', function ($table) {
                $table->boolean('is_spol')->default(false)->after('is_active');
            });
        }
    }

    public function down(): void
    {
        if (Schema::connection('pgsql')->hasColumn('Main.Category', 'is_spol')) {
            Schema::connection('pgsql')->table('Main.Category', function ($table) {
                $table->dropColumn('is_spol');
            });
        }
    }
};
