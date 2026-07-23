<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $pgsql = DB::connection('pgsql');

        // SalesOrderItems: add custom_name, make ProductID nullable
        $pgsql->statement('ALTER TABLE "Main"."SalesOrderItems" ADD COLUMN custom_name varchar(255) NULL');
        $pgsql->statement('ALTER TABLE "Main"."SalesOrderItems" DROP CONSTRAINT IF EXISTS "salesorderitems_productid_foreign"');
        $pgsql->statement('ALTER TABLE "Main"."SalesOrderItems" ALTER COLUMN "ProductID" DROP NOT NULL');
        $pgsql->statement('ALTER TABLE "Main"."SalesOrderItems" ADD CONSTRAINT "salesorderitems_productid_foreign" FOREIGN KEY ("ProductID") REFERENCES "Main"."Products"("id") ON DELETE RESTRICT');

        // JobOrderServices: add custom_name, make ServiceID nullable
        $pgsql->statement('ALTER TABLE "Main"."JobOrderServices" ADD COLUMN custom_name varchar(255) NULL');
        $pgsql->statement('ALTER TABLE "Main"."JobOrderServices" DROP CONSTRAINT IF EXISTS "joborderservices_serviceid_foreign"');
        $pgsql->statement('ALTER TABLE "Main"."JobOrderServices" ALTER COLUMN "ServiceID" DROP NOT NULL');
        $pgsql->statement('ALTER TABLE "Main"."JobOrderServices" ADD CONSTRAINT "joborderservices_serviceid_foreign" FOREIGN KEY ("ServiceID") REFERENCES "Main"."ServiceType"("id") ON DELETE RESTRICT');
    }

    public function down(): void
    {
        $pgsql = DB::connection('pgsql');

        $pgsql->statement('ALTER TABLE "Main"."SalesOrderItems" DROP COLUMN IF EXISTS custom_name');
        $pgsql->statement('ALTER TABLE "Main"."SalesOrderItems" ALTER COLUMN "ProductID" SET NOT NULL');

        $pgsql->statement('ALTER TABLE "Main"."JobOrderServices" DROP COLUMN IF EXISTS custom_name');
        $pgsql->statement('ALTER TABLE "Main"."JobOrderServices" ALTER COLUMN "ServiceID" SET NOT NULL');
    }
};
