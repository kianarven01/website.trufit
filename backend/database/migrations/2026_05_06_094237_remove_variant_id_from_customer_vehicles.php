<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('Main.CustomerVehicles', function (Blueprint $table) {
            // Drop foreign key if it exists. Note: exact FK name depends on how it was created.
            // Often it's `customervehicles_variant_id_foreign` or similar.
            // Since it's an existing DB schema that might not follow Laravel naming conventions perfectly,
            // we'll try to drop the column directly, which cascade drops or we might need to drop constraint first.
            // Let's assume dropping column works or write a raw query.
        });
        
        // Use DB statement to drop foreign key constraint safely if it exists
        DB::statement('ALTER TABLE "Main"."CustomerVehicles" DROP CONSTRAINT IF EXISTS "CustomerVehicles_variant_id_fkey"');
        DB::statement('ALTER TABLE "Main"."CustomerVehicles" DROP CONSTRAINT IF EXISTS "customervehicles_variant_id_foreign"');

        Schema::table('Main.CustomerVehicles', function (Blueprint $table) {
            if (Schema::hasColumn('Main.CustomerVehicles', 'variant_id')) {
                $table->dropColumn('variant_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('Main.CustomerVehicles', function (Blueprint $table) {
            if (!Schema::hasColumn('Main.CustomerVehicles', 'variant_id')) {
                $table->unsignedBigInteger('variant_id')->nullable();
                // Optionally add foreign key back if down is run
            }
        });
    }
};
