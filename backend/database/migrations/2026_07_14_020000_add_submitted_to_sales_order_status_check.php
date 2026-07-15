<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            ALTER TABLE \"Main\".\"SalesOrder\" 
            DROP CONSTRAINT IF EXISTS \"SalesOrder_Status_check\"
        ");

        DB::statement("
            ALTER TABLE \"Main\".\"SalesOrder\" 
            ADD CONSTRAINT \"SalesOrder_Status_check\" 
            CHECK (\"Status\" = ANY (ARRAY['DRAFT'::text, 'PENDING'::text, 'SUBMITTED'::text, 'APPROVED'::text, 'IN_PROGRESS'::text, 'COMPLETED'::text, 'CANCELLED'::text]))
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE \"Main\".\"SalesOrder\" 
            DROP CONSTRAINT IF EXISTS \"SalesOrder_Status_check\"
        ");

        DB::statement("
            ALTER TABLE \"Main\".\"SalesOrder\" 
            ADD CONSTRAINT \"SalesOrder_Status_check\" 
            CHECK (\"Status\" = ANY (ARRAY['DRAFT'::text, 'PENDING'::text, 'APPROVED'::text, 'IN_PROGRESS'::text, 'COMPLETED'::text, 'CANCELLED'::text]))
        ");
    }
};
