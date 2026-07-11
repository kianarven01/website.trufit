<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // PurchaseOrders
        DB::statement('ALTER TABLE "PurchaseOrders" DROP CONSTRAINT IF EXISTS "PurchaseOrders_status_check"');
        DB::statement('ALTER TABLE "PurchaseOrders" ADD CONSTRAINT "PurchaseOrders_status_check" CHECK (status = ANY (ARRAY[\'DRAFT\'::text, \'SUBMITTED\'::text, \'APPROVED\'::text, \'PARTIALLY_RECEIVED\'::text, \'COMPLETED\'::text, \'CANCELLED\'::text]))');

        // GoodsReceipts
        DB::statement('ALTER TABLE "GoodsReceipts" DROP CONSTRAINT IF EXISTS "GoodsReceipts_status_check"');
        DB::statement('ALTER TABLE "GoodsReceipts" ADD CONSTRAINT "GoodsReceipts_status_check" CHECK (status = ANY (ARRAY[\'DRAFT\'::text, \'SUBMITTED\'::text, \'RECEIVED\'::text, \'CANCELLED\'::text, \'PARTIALLY_RETURNED\'::text, \'RETURNED\'::text]))');
    }

    public function down(): void
    {
        // PurchaseOrders
        DB::statement('ALTER TABLE "PurchaseOrders" DROP CONSTRAINT IF EXISTS "PurchaseOrders_status_check"');
        DB::statement('ALTER TABLE "PurchaseOrders" ADD CONSTRAINT "PurchaseOrders_status_check" CHECK (status = ANY (ARRAY[\'DRAFT\'::text, \'SUBMITTED\'::text, \'APPROVED\'::text, \'PARTIALLY_RECEIVED\'::text, \'RECEIVED\'::text, \'CANCELLED\'::text]))');

        // GoodsReceipts
        DB::statement('ALTER TABLE "GoodsReceipts" DROP CONSTRAINT IF EXISTS "GoodsReceipts_status_check"');
        DB::statement('ALTER TABLE "GoodsReceipts" ADD CONSTRAINT "GoodsReceipts_status_check" CHECK (status = ANY (ARRAY[\'DRAFT\'::text, \'RECEIVED\'::text, \'APPROVED\'::text, \'CANCELLED\'::text, \'PARTIALLY_RETURNED\'::text, \'RETURNED\'::text]))');
    }
};
