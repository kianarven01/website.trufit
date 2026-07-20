<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('pgsql')->table('Main.JobOrder', function ($table) {
            if (!Schema::connection('pgsql')->hasColumn('Main.JobOrder', 'estimate_id')) {
                $table->uuid('estimate_id')->nullable()->after('jo_number');
                $table->foreign('estimate_id')->references('id')->on('Main.Estimates')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::connection('pgsql')->table('Main.JobOrder', function ($table) {
            if (Schema::connection('pgsql')->hasColumn('Main.JobOrder', 'estimate_id')) {
                $table->dropForeign(['estimate_id']);
                $table->dropColumn('estimate_id');
            }
        });
    }
};
