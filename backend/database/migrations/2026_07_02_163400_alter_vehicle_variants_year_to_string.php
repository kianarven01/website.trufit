<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Change the column type from integer to varchar(50)
        DB::statement('ALTER TABLE "Main"."VehicleVariants" ALTER COLUMN "year" TYPE VARCHAR(50);');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Convert column back to integer (converting non-numeric strings to null/default if necessary)
        DB::statement('ALTER TABLE "Main"."VehicleVariants" ALTER COLUMN "year" TYPE INTEGER USING (year::integer);');
    }
};
