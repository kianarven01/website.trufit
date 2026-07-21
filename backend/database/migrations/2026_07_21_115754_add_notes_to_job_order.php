<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('pgsql')->table('Main.JobOrder', function ($table) {
            if (!Schema::connection('pgsql')->hasColumn('Main.JobOrder', 'notes')) {
                $table->text('notes')->nullable()->after('vehicle_id_new');
            }
        });
    }

    public function down(): void
    {
        Schema::connection('pgsql')->table('Main.JobOrder', function ($table) {
            if (Schema::connection('pgsql')->hasColumn('Main.JobOrder', 'notes')) {
                $table->dropColumn('notes');
            }
        });
    }
};
