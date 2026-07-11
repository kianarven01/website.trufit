<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE "PurchaseOrders" DROP CONSTRAINT IF EXISTS "PurchaseOrders_status_check"');
        DB::statement('ALTER TABLE "PurchaseOrders" ADD CONSTRAINT "PurchaseOrders_status_check" CHECK (status = ANY (ARRAY[\'DRAFT\'::text, \'SUBMITTED\'::text, \'APPROVED\'::text, \'PARTIALLY_RECEIVED\'::text, \'COMPLETED\'::text, \'RETURNED\'::text, \'CANCELLED\'::text]))');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE "PurchaseOrders" DROP CONSTRAINT IF EXISTS "PurchaseOrders_status_check"');
        DB::statement('ALTER TABLE "PurchaseOrders" ADD CONSTRAINT "PurchaseOrders_status_check" CHECK (status = ANY (ARRAY[\'DRAFT\'::text, \'SUBMITTED\'::text, \'APPROVED\'::text, \'PARTIALLY_RECEIVED\'::text, \'COMPLETED\'::text, \'CANCELLED\'::text]))');
    }
};
