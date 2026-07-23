<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::connection('pgsql')->statement(
            'ALTER TABLE "Main"."SalesOrder" ADD COLUMN completed_by bigint NULL'
        );
    }

    public function down(): void
    {
        DB::connection('pgsql')->statement(
            'ALTER TABLE "Main"."SalesOrder" DROP COLUMN IF EXISTS completed_by'
        );
    }
};
