<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Alter PurchaseOrders table: add submitted_by, set created_by to NOT NULL, and add foreign key constraints
        Schema::table('PurchaseOrders', function (Blueprint $table) {
            $table->unsignedBigInteger('submitted_by')->nullable();
        });

        // Set created_by to NOT NULL (we assume table is empty/truncated first)
        DB::statement('ALTER TABLE "PurchaseOrders" ALTER COLUMN created_by SET NOT NULL');

        // Add foreign keys
        Schema::table('PurchaseOrders', function (Blueprint $table) {
            $table->foreign('created_by')->references('id')->on('UserCredentials')->onDelete('restrict');
            $table->foreign('submitted_by')->references('id')->on('UserCredentials')->onDelete('set null');
            $table->foreign('approved_by')->references('id')->on('UserCredentials')->onDelete('set null');
            $table->foreign('cancelled_by')->references('id')->on('UserCredentials')->onDelete('set null');
        });

        // Alter GoodsReceipts table: add returned_by, set received_by to NOT NULL, and add foreign key constraints
        Schema::table('GoodsReceipts', function (Blueprint $table) {
            $table->unsignedBigInteger('returned_by')->nullable();
        });

        // Set received_by to NOT NULL
        DB::statement('ALTER TABLE "GoodsReceipts" ALTER COLUMN received_by SET NOT NULL');

        // Add foreign keys
        Schema::table('GoodsReceipts', function (Blueprint $table) {
            $table->foreign('received_by')->references('id')->on('UserCredentials')->onDelete('restrict');
            $table->foreign('approved_by')->references('id')->on('UserCredentials')->onDelete('set null');
            $table->foreign('returned_by')->references('id')->on('UserCredentials')->onDelete('set null');
            $table->foreign('cancelled_by')->references('id')->on('UserCredentials')->onDelete('set null');
        });
    }

    public function down(): void
    {
        // Drop foreign keys from PurchaseOrders
        Schema::table('PurchaseOrders', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropForeign(['submitted_by']);
            $table->dropForeign(['approved_by']);
            $table->dropForeign(['cancelled_by']);
            $table->dropColumn('submitted_by');
        });

        DB::statement('ALTER TABLE "PurchaseOrders" ALTER COLUMN created_by DROP NOT NULL');

        // Drop foreign keys from GoodsReceipts
        Schema::table('GoodsReceipts', function (Blueprint $table) {
            $table->dropForeign(['received_by']);
            $table->dropForeign(['approved_by']);
            $table->dropForeign(['returned_by']);
            $table->dropForeign(['cancelled_by']);
            $table->dropColumn('returned_by');
        });

        DB::statement('ALTER TABLE "GoodsReceipts" ALTER COLUMN received_by DROP NOT NULL');
    }
};
