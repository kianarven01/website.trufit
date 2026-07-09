<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('
            CREATE TABLE "Main"."BinLocations" (
                "id" uuid PRIMARY KEY,
                "warehouse_id" uuid NOT NULL,
                "code" text NOT NULL,
                "name" text NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" timestamptz NULL DEFAULT now(),
                CONSTRAINT "binlocations_warehouse_id_fkey"
                    FOREIGN KEY ("warehouse_id")
                    REFERENCES "Main"."StockLocations"("id")
                    ON DELETE CASCADE,
                CONSTRAINT "binlocations_warehouse_code_unique"
                    UNIQUE ("warehouse_id", "code")
            )
        ');

        Schema::table('Main.Inventory', function ($table) {
            $table->uuid('bin_id')->nullable()->after('location_id');
        });
    }

    public function down(): void
    {
        Schema::table('Main.Inventory', function ($table) {
            $table->dropColumn('bin_id');
        });

        DB::statement('DROP TABLE IF EXISTS "Main"."BinLocations"');
    }
};
