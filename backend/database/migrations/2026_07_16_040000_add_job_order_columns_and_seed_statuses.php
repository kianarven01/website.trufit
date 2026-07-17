<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Add jo_number to JobOrder
        Schema::connection('pgsql')->table('Main.JobOrder', function (Blueprint $table) {
            if (!Schema::connection('pgsql')->hasColumn('Main.JobOrder', 'jo_number')) {
                $table->text('jo_number')->nullable()->after('id');
            }
        });

        // Add job_order_id back to SalesOrder (was dropped earlier)
        Schema::connection('pgsql')->table('Main.SalesOrder', function (Blueprint $table) {
            if (!Schema::connection('pgsql')->hasColumn('Main.SalesOrder', 'job_order_id')) {
                $table->uuid('job_order_id')->nullable()->after('vehicle_id');
                $table->foreign('job_order_id')->references('id')->on('Main.JobOrder')->nullOnDelete();
            }
        });

        // Seed JO statuses into Main.Status table
        $statuses = [
            ['name' => 'Pending',    'category' => 'JOB_ORDER'],
            ['name' => 'In Progress','category' => 'JOB_ORDER'],
            ['name' => 'Completed',  'category' => 'JOB_ORDER'],
            ['name' => 'Cancelled',  'category' => 'JOB_ORDER'],
        ];

        foreach ($statuses as $status) {
            $exists = DB::connection('pgsql')
                ->table('Main.Status')
                ->where('name', $status['name'])
                ->where('category', $status['category'])
                ->exists();

            if (!$exists) {
                DB::connection('pgsql')->table('Main.Status')->insert([
                    'id' => DB::raw('gen_random_uuid()'),
                    'name' => $status['name'],
                    'category' => $status['category'],
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::connection('pgsql')->table('Main.JobOrder', function (Blueprint $table) {
            if (Schema::connection('pgsql')->hasColumn('Main.JobOrder', 'jo_number')) {
                $table->dropColumn('jo_number');
            }
        });

        Schema::connection('pgsql')->table('Main.SalesOrder', function (Blueprint $table) {
            if (Schema::connection('pgsql')->hasColumn('Main.SalesOrder', 'job_order_id')) {
                $table->dropForeign(['job_order_id']);
                $table->dropColumn('job_order_id');
            }
        });
    }
};
