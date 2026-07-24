<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::connection('pgsql')->statement(
            'ALTER TABLE "Main"."SalesOrderItems" ADD COLUMN original_custom_price numeric(15,2) NULL'
        );
    }

    public function down(): void
    {
        DB::connection('pgsql')->statement(
            'ALTER TABLE "Main"."SalesOrderItems" DROP COLUMN IF EXISTS original_custom_price'
        );
    }
};
