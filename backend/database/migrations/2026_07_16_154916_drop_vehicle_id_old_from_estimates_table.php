<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::connection('pgsql')->statement(
            'ALTER TABLE "Main"."Estimates" DROP COLUMN "vehicle_id_old"'
        );
    }

    public function down(): void
    {
        DB::connection('pgsql')->statement(
            'ALTER TABLE "Main"."Estimates" ADD COLUMN "vehicle_id_old" character varying NOT NULL DEFAULT \'\''
        );
    }
};
