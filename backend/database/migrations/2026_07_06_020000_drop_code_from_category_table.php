<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::connection('pgsql')->hasColumn('Main.Category', 'code')) {
            Schema::connection('pgsql')->table('Main.Category', function ($table) {
                $table->dropColumn('code');
            });
        }
    }

    public function down(): void
    {
        if (!Schema::connection('pgsql')->hasColumn('Main.Category', 'code')) {
            Schema::connection('pgsql')->table('Main.Category', function ($table) {
                $table->string('code', 50)->nullable()->after('name');
            });
        }
    }
};
