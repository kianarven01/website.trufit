<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE "Main"."SalesOrder" DROP CONSTRAINT IF EXISTS "SalesOrder_submitted_by_foreign"');
        DB::statement('ALTER TABLE "Main"."SalesOrder" DROP CONSTRAINT IF EXISTS "SalesOrder_cancelled_by_foreign"');
        DB::statement('ALTER TABLE "Main"."SalesOrder" DROP COLUMN IF EXISTS "submitted_by"');
        DB::statement('ALTER TABLE "Main"."SalesOrder" DROP COLUMN IF EXISTS "cancelled_by"');

        DB::statement('ALTER TABLE "Main"."SalesOrder" ADD COLUMN "submitted_by" bigint NULL');
        DB::statement('ALTER TABLE "Main"."SalesOrder" ADD COLUMN "cancelled_by" bigint NULL');

        DB::statement('ALTER TABLE "Main"."SalesOrder" ADD CONSTRAINT "SalesOrder_submitted_by_foreign" FOREIGN KEY ("submitted_by") REFERENCES "UserCredentials"("id") ON DELETE SET NULL');
        DB::statement('ALTER TABLE "Main"."SalesOrder" ADD CONSTRAINT "SalesOrder_cancelled_by_foreign" FOREIGN KEY ("cancelled_by") REFERENCES "UserCredentials"("id") ON DELETE SET NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE "Main"."SalesOrder" DROP CONSTRAINT IF EXISTS "SalesOrder_submitted_by_foreign"');
        DB::statement('ALTER TABLE "Main"."SalesOrder" DROP CONSTRAINT IF EXISTS "SalesOrder_cancelled_by_foreign"');
        DB::statement('ALTER TABLE "Main"."SalesOrder" DROP COLUMN IF EXISTS "submitted_by"');
        DB::statement('ALTER TABLE "Main"."SalesOrder" DROP COLUMN IF EXISTS "cancelled_by"');

        DB::statement('ALTER TABLE "Main"."SalesOrder" ADD COLUMN "submitted_by" integer NULL');
        DB::statement('ALTER TABLE "Main"."SalesOrder" ADD COLUMN "cancelled_by" integer NULL');

        DB::statement('ALTER TABLE "Main"."SalesOrder" ADD CONSTRAINT "SalesOrder_submitted_by_foreign" FOREIGN KEY ("submitted_by") REFERENCES "Main"."Employees"("id") ON DELETE SET NULL');
        DB::statement('ALTER TABLE "Main"."SalesOrder" ADD CONSTRAINT "SalesOrder_cancelled_by_foreign" FOREIGN KEY ("cancelled_by") REFERENCES "Main"."Employees"("id") ON DELETE SET NULL');
    }
};
