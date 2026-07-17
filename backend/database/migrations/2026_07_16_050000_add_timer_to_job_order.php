<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('pgsql')->table('Main.JobOrder', function (Blueprint $table) {
            if (!Schema::connection('pgsql')->hasColumn('Main.JobOrder', 'timer_status')) {
                $table->text('timer_status')->nullable()->after('vehicle_id_new');
            }
            if (!Schema::connection('pgsql')->hasColumn('Main.JobOrder', 'timer_started_at')) {
                $table->timestamp('timer_started_at')->nullable()->after('timer_status');
            }
            if (!Schema::connection('pgsql')->hasColumn('Main.JobOrder', 'timer_total_seconds')) {
                $table->integer('timer_total_seconds')->default(0)->after('timer_started_at');
            }
        });
    }

    public function down(): void
    {
        Schema::connection('pgsql')->table('Main.JobOrder', function (Blueprint $table) {
            $columns = ['timer_status', 'timer_started_at', 'timer_total_seconds'];
            foreach ($columns as $col) {
                if (Schema::connection('pgsql')->hasColumn('Main.JobOrder', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
