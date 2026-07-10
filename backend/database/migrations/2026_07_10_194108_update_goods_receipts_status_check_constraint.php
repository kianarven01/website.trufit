<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE "GoodsReceipts" DROP CONSTRAINT IF EXISTS "GoodsReceipts_status_check"');
        DB::statement('ALTER TABLE "GoodsReceipts" ADD CONSTRAINT "GoodsReceipts_status_check" CHECK (status = ANY (ARRAY[\'DRAFT\'::text, \'APPROVED\'::text, \'CANCELLED\'::text, \'PARTIALLY_RETURNED\'::text, \'RETURNED\'::text]))');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE "GoodsReceipts" DROP CONSTRAINT IF EXISTS "GoodsReceipts_status_check"');
        DB::statement('ALTER TABLE "GoodsReceipts" ADD CONSTRAINT "GoodsReceipts_status_check" CHECK (status = ANY (ARRAY[\'DRAFT\'::text, \'APPROVED\'::text, \'CANCELLED\'::text]))');
    }
};
