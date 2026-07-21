<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('pgsql')->table('Main.Estimates', function ($table) {
            if (!Schema::connection('pgsql')->hasColumn('Main.Estimates', 'deleted_at')) {
                $table->timestamp('deleted_at')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::connection('pgsql')->table('Main.Estimates', function ($table) {
            if (Schema::connection('pgsql')->hasColumn('Main.Estimates', 'deleted_at')) {
                $table->dropColumn('deleted_at');
            }
        });
    }
};
