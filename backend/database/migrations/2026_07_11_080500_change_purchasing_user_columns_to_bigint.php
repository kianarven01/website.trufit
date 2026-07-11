<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Alter PurchaseOrders table user ID columns to bigint
        DB::statement('ALTER TABLE "PurchaseOrders" DROP COLUMN IF EXISTS created_by');
        DB::statement('ALTER TABLE "PurchaseOrders" DROP COLUMN IF EXISTS approved_by');
        DB::statement('ALTER TABLE "PurchaseOrders" DROP COLUMN IF EXISTS cancelled_by');
        
        Schema::table('PurchaseOrders', function (Blueprint $table) {
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->unsignedBigInteger('cancelled_by')->nullable();
        });

        // Alter GoodsReceipts table user ID columns to bigint
        DB::statement('ALTER TABLE "GoodsReceipts" DROP COLUMN IF EXISTS received_by');
        DB::statement('ALTER TABLE "GoodsReceipts" DROP COLUMN IF EXISTS approved_by');
        DB::statement('ALTER TABLE "GoodsReceipts" DROP COLUMN IF EXISTS cancelled_by');

        Schema::table('GoodsReceipts', function (Blueprint $table) {
            $table->unsignedBigInteger('received_by')->nullable();
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->unsignedBigInteger('cancelled_by')->nullable();
        });
    }

    public function down(): void
    {
        // Revert to UUID
        DB::statement('ALTER TABLE "PurchaseOrders" DROP COLUMN IF EXISTS created_by');
        DB::statement('ALTER TABLE "PurchaseOrders" DROP COLUMN IF EXISTS approved_by');
        DB::statement('ALTER TABLE "PurchaseOrders" DROP COLUMN IF EXISTS cancelled_by');

        Schema::table('PurchaseOrders', function (Blueprint $table) {
            $table->uuid('created_by')->nullable();
            $table->uuid('approved_by')->nullable();
            $table->uuid('cancelled_by')->nullable();
        });

        DB::statement('ALTER TABLE "GoodsReceipts" DROP COLUMN IF EXISTS received_by');
        DB::statement('ALTER TABLE "GoodsReceipts" DROP COLUMN IF EXISTS approved_by');
        DB::statement('ALTER TABLE "GoodsReceipts" DROP COLUMN IF EXISTS cancelled_by');

        Schema::table('GoodsReceipts', function (Blueprint $table) {
            $table->uuid('received_by')->nullable();
            $table->uuid('approved_by')->nullable();
            $table->uuid('cancelled_by')->nullable();
        });
    }
};
