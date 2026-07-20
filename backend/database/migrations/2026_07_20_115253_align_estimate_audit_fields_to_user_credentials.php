<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // ── Estimates: created_by & edited_by FK → UserCredentials ──

        // Drop existing FK constraints pointing to Employees
        $fks = DB::select("
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_name = 'Estimates'
            AND table_schema = 'Main'
            AND constraint_name LIKE '%created_by%'
        ");
        foreach ($fks as $fk) {
            DB::statement('ALTER TABLE "Main"."Estimates" DROP CONSTRAINT IF EXISTS "' . $fk->constraint_name . '"');
        }

        $fks = DB::select("
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_name = 'Estimates'
            AND table_schema = 'Main'
            AND constraint_name LIKE '%edited_by%'
        ");
        foreach ($fks as $fk) {
            DB::statement('ALTER TABLE "Main"."Estimates" DROP CONSTRAINT IF EXISTS "' . $fk->constraint_name . '"');
        }

        // Change column types integer → bigint
        DB::statement('ALTER TABLE "Main"."Estimates" ALTER COLUMN "created_by" TYPE bigint USING "created_by"::bigint');
        DB::statement('ALTER TABLE "Main"."Estimates" ALTER COLUMN "edited_by" TYPE bigint USING "edited_by"::bigint');

        // Add new FK constraints → UserCredentials
        DB::statement('ALTER TABLE "Main"."Estimates" ADD CONSTRAINT "Estimates_created_by_foreign" FOREIGN KEY ("created_by") REFERENCES "UserCredentials"("id") ON DELETE SET NULL');
        DB::statement('ALTER TABLE "Main"."Estimates" ADD CONSTRAINT "Estimates_edited_by_foreign" FOREIGN KEY ("edited_by") REFERENCES "UserCredentials"("id") ON DELETE SET NULL');

        // ── EstimateItems: add is_tentative column ──
        if (!DB::connection('pgsql')->select("SELECT 1 FROM information_schema.columns WHERE table_name='EstimateItems' AND column_name='is_tentative' AND table_schema='Main'")) {
            DB::statement('ALTER TABLE "Main"."EstimateItems" ADD COLUMN "is_tentative" boolean DEFAULT false');
        }
    }

    public function down(): void
    {
        // Revert Estimates FKs back to Employees
        DB::statement('ALTER TABLE "Main"."Estimates" DROP CONSTRAINT IF EXISTS "Estimates_created_by_foreign"');
        DB::statement('ALTER TABLE "Main"."Estimates" ALTER COLUMN "created_by" TYPE integer USING "created_by"::integer');
        DB::statement('ALTER TABLE "Main"."Estimates" ADD CONSTRAINT "Estimates_created_by_foreign" FOREIGN KEY ("created_by") REFERENCES "Main"."Employees"("id") ON DELETE SET NULL');

        DB::statement('ALTER TABLE "Main"."Estimates" DROP CONSTRAINT IF EXISTS "Estimates_edited_by_foreign"');
        DB::statement('ALTER TABLE "Main"."Estimates" ALTER COLUMN "edited_by" TYPE integer USING "edited_by"::integer');
        DB::statement('ALTER TABLE "Main"."Estimates" ADD CONSTRAINT "Estimates_edited_by_foreign" FOREIGN KEY ("edited_by") REFERENCES "Main"."Employees"("id") ON DELETE SET NULL');

        // Drop is_tentative
        DB::statement('ALTER TABLE "Main"."EstimateItems" DROP COLUMN IF EXISTS "is_tentative"');
    }
};
