<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('
            ALTER TABLE "Main"."StockMovements"
            DROP CONSTRAINT IF EXISTS "StockMovements_movement_type_check"
        ');

        DB::statement("
            ALTER TABLE \"Main\".\"StockMovements\"
            ADD CONSTRAINT \"StockMovements_movement_type_check\"
            CHECK (movement_type = ANY (
                ARRAY[
                    'IN_RECEIPT'::text,
                    'OUT_SALES'::text,
                    'OUT_SUNDRIES'::text,
                    'ADJUSTMENT_IN'::text,
                    'ADJUSTMENT_OUT'::text,
                    'RETURN'::text
                ]
            ))
        ");
    }

    public function down(): void
    {
        DB::statement('
            ALTER TABLE "Main"."StockMovements"
            DROP CONSTRAINT IF EXISTS "StockMovements_movement_type_check"
        ');

        DB::statement("
            ALTER TABLE \"Main\".\"StockMovements\"
            ADD CONSTRAINT \"StockMovements_movement_type_check\"
            CHECK (movement_type = ANY (
                ARRAY[
                    'IN_RECEIPT'::text,
                    'OUT_SALES'::text,
                    'ADJUSTMENT_IN'::text,
                    'ADJUSTMENT_OUT'::text,
                    'RETURN'::text
                ]
            ))
        ");
    }
};
