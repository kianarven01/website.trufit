<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('Main.PurchaseOrders', function (Blueprint $table) {
            $table->decimal('received_amount', 12, 2)->default(0)->after('total_amount');
        });

        // Backfill: calculate received_amount for all existing POs
        DB::statement('
            UPDATE "Main"."PurchaseOrders" po
            SET received_amount = COALESCE(sub.total_received, 0)
            FROM (
                SELECT
                    poi.purchase_order_id,
                    SUM(
                        (gri.quantity_received - gri.quantity_returned) * poi.unit_cost
                    ) AS total_received
                FROM "Main"."GoodsReceiptItems" gri
                JOIN "Main"."GoodsReceipts" gr ON gr.id = gri.goods_receipt_id
                JOIN "Main"."PurchaseOrderItems" poi ON poi.id = gri.purchase_order_item_id
                WHERE gr.status IN (\'RECEIVED\', \'PARTIALLY_RETURNED\', \'RETURNED\')
                GROUP BY poi.purchase_order_id
            ) sub
            WHERE po.id = sub.purchase_order_id
        ');
    }

    public function down(): void
    {
        Schema::table('Main.PurchaseOrders', function (Blueprint $table) {
            $table->dropColumn('received_amount');
        });
    }
};
