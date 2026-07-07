<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('pgsql')->table('Main.Products', function (Blueprint $table) {
            $table->string('item_type', 20)->nullable()->default('part')->after('name');
        });

        DB::statement('ALTER TABLE "Main"."Products" ALTER COLUMN "part_number" DROP NOT NULL');
        DB::statement('ALTER TABLE "Main"."Products" ALTER COLUMN "part_number" DROP DEFAULT');

        $constraints = DB::select("
            SELECT conname FROM pg_constraint
            WHERE conrelid = '\"Main\".\"Products\"'::regclass
            AND contype = 'c'
            AND pg_get_constraintdef(oid) ILIKE '%part_number%'
        ");
        foreach ($constraints as $constraint) {
            DB::statement('ALTER TABLE "Main"."Products" DROP CONSTRAINT "' . $constraint->conname . '"');
        }
    }

    public function down(): void
    {
        Schema::connection('pgsql')->table('Main.Products', function (Blueprint $table) {
            $table->dropColumn('item_type');
        });

        DB::statement('ALTER TABLE "Main"."Products" ALTER COLUMN "part_number" SET NOT NULL');
        DB::statement('ALTER TABLE "Main"."Products" ALTER COLUMN "part_number" SET DEFAULT \'\'::text');
        DB::statement('ALTER TABLE "Main"."Products" ADD CONSTRAINT "Products_part_number_check" CHECK (length(TRIM(BOTH FROM part_number)) > 0)');
    }
};
