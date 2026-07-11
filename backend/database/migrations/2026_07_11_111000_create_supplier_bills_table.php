<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('SupplierBills', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('bill_number');
            $table->uuid('purchase_order_id');
            $table->string('status');
            $table->date('bill_date');
            $table->date('due_date');
            $table->decimal('total_amount', 15, 2);
            $table->text('notes')->nullable();
            
            $table->unsignedBigInteger('created_by');
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->unsignedBigInteger('paid_by')->nullable();
            $table->datetime('paid_at')->nullable();
            $table->timestamps();

            $table->foreign('purchase_order_id')->references('id')->on('PurchaseOrders')->onDelete('restrict');
            $table->foreign('created_by')->references('id')->on('UserCredentials')->onDelete('restrict');
            $table->foreign('approved_by')->references('id')->on('UserCredentials')->onDelete('restrict');
            $table->foreign('paid_by')->references('id')->on('UserCredentials')->onDelete('restrict');

            // Unique bill number per purchase order (prevents duplicate invoice entry for same contract)
            $table->unique(['purchase_order_id', 'bill_number']);
        });

        // Add check constraint for status
        DB::statement('ALTER TABLE "SupplierBills" ADD CONSTRAINT "SupplierBills_status_check" CHECK (status = ANY (ARRAY[\'DRAFT\'::text, \'MATCH_EXCEPTION\'::text, \'AWAITING_PAYMENT\'::text, \'PAID\'::text, \'VOID\'::text]))');

        Schema::create('SupplierBillItems', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('supplier_bill_id');
            $table->uuid('purchase_order_item_id');
            $table->uuid('product_id');
            $table->integer('quantity_billed');
            $table->decimal('unit_price', 15, 2);
            $table->decimal('line_total', 15, 2);
            $table->timestamps();

            $table->foreign('supplier_bill_id')->references('id')->on('SupplierBills')->onDelete('cascade');
            $table->foreign('purchase_order_item_id')->references('id')->on('PurchaseOrderItems')->onDelete('restrict');
            $table->foreign('product_id')->references('id')->on('Products')->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('SupplierBillItems');
        Schema::dropIfExists('SupplierBills');
    }
};
