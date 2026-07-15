<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('pgsql')->table('Main.SalesOrder', function (Blueprint $table) {
            if (!Schema::connection('pgsql')->hasColumn('Main.SalesOrder', 'type')) {
                $table->string('type', 20)->default('COUNTER');
            }
        });

        // Backfill: SOs linked to an estimate are REPAIR, others are COUNTER
        DB::statement("
            UPDATE \"Main\".\"SalesOrder\"
            SET \"type\" = CASE
                WHEN \"estimate_id\" IS NOT NULL THEN 'REPAIR'
                ELSE 'COUNTER'
            END
        ");

        // Add CHECK constraint
        DB::statement("
            ALTER TABLE \"Main\".\"SalesOrder\"
            ADD CONSTRAINT \"SalesOrder_type_check\"
            CHECK (\"type\" = ANY (ARRAY['COUNTER'::text, 'REPAIR'::text]))
        ");
    }

    public function down(): void
    {
        DB::statement("
            ALTER TABLE \"Main\".\"SalesOrder\"
            DROP CONSTRAINT IF EXISTS \"SalesOrder_type_check\"
        ");

        Schema::connection('pgsql')->table('Main.SalesOrder', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }
};
