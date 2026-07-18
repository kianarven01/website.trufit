<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── SalesOrder ──
        // Drop existing FK → Employees
        $soFks = DB::select("SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'SalesOrder' AND table_schema = 'Main' AND constraint_name LIKE '%approved_by%'");
        foreach ($soFks as $fk) {
            DB::statement('ALTER TABLE "Main"."SalesOrder" DROP CONSTRAINT IF EXISTS "' . $fk->constraint_name . '"');
        }

        // Change column type integer → bigint
        DB::statement('ALTER TABLE "Main"."SalesOrder" ALTER COLUMN "approved_by" TYPE bigint USING "approved_by"::bigint');

        // Add new FK → UserCredentials
        DB::statement('ALTER TABLE "Main"."SalesOrder" ADD CONSTRAINT "SalesOrder_approved_by_foreign" FOREIGN KEY ("approved_by") REFERENCES "UserCredentials"("id") ON DELETE SET NULL');

        // ── Estimates ──
        $estFks = DB::select("SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'Estimates' AND table_schema = 'Main' AND constraint_name LIKE '%approved_by%'");
        foreach ($estFks as $fk) {
            DB::statement('ALTER TABLE "Main"."Estimates" DROP CONSTRAINT IF EXISTS "' . $fk->constraint_name . '"');
        }

        DB::statement('ALTER TABLE "Main"."Estimates" ALTER COLUMN "approved_by" TYPE bigint USING "approved_by"::bigint');

        DB::statement('ALTER TABLE "Main"."Estimates" ADD CONSTRAINT "Estimates_approved_by_foreign" FOREIGN KEY ("approved_by") REFERENCES "UserCredentials"("id") ON DELETE SET NULL');
    }

    public function down(): void
    {
        // ── SalesOrder ──
        DB::statement('ALTER TABLE "Main"."SalesOrder" DROP CONSTRAINT IF EXISTS "SalesOrder_approved_by_foreign"');
        DB::statement('ALTER TABLE "Main"."SalesOrder" ALTER COLUMN "approved_by" TYPE integer USING "approved_by"::integer');
        DB::statement('ALTER TABLE "Main"."SalesOrder" ADD CONSTRAINT "SalesOrder_approved_by_foreign" FOREIGN KEY ("approved_by") REFERENCES "Main"."Employees"("id") ON DELETE SET NULL');

        // ── Estimates ──
        DB::statement('ALTER TABLE "Main"."Estimates" DROP CONSTRAINT IF EXISTS "Estimates_approved_by_foreign"');
        DB::statement('ALTER TABLE "Main"."Estimates" ALTER COLUMN "approved_by" TYPE integer USING "approved_by"::integer');
        DB::statement('ALTER TABLE "Main"."Estimates" ADD CONSTRAINT "Estimates_approved_by_foreign" FOREIGN KEY ("approved_by") REFERENCES "Main"."Employees"("id") ON DELETE SET NULL');
    }
};
