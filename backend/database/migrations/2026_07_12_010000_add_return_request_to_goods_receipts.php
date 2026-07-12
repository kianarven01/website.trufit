<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Add new columns
        Schema::table('Main.GoodsReceipts', function ($table) {
            $table->json('return_request_items')->nullable()->after('notes');
            $table->unsignedBigInteger('return_requested_by')->nullable()->after('returned_by');
            $table->timestamp('return_requested_at')->nullable()->after('return_requested_by');
        });

        // Update status check constraint to include RETURN_REQUESTED
        DB::statement('ALTER TABLE "GoodsReceipts" DROP CONSTRAINT IF EXISTS "GoodsReceipts_status_check"');
        DB::statement("ALTER TABLE \"GoodsReceipts\" ADD CONSTRAINT \"GoodsReceipts_status_check\" CHECK (status = ANY (ARRAY['DRAFT'::text, 'SUBMITTED'::text, 'RECEIVED'::text, 'APPROVED'::text, 'CANCELLED'::text, 'PARTIALLY_RETURNED'::text, 'RETURNED'::text, 'RETURN_REQUESTED'::text]))");
    }

    public function down(): void
    {
        // Revert status check constraint
        DB::statement('ALTER TABLE "GoodsReceipts" DROP CONSTRAINT IF EXISTS "GoodsReceipts_status_check"');
        DB::statement("ALTER TABLE \"GoodsReceipts\" ADD CONSTRAINT \"GoodsReceipts_status_check\" CHECK (status = ANY (ARRAY['DRAFT'::text, 'SUBMITTED'::text, 'RECEIVED'::text, 'APPROVED'::text, 'CANCELLED'::text, 'PARTIALLY_RETURNED'::text, 'RETURNED'::text]))");

        Schema::table('Main.GoodsReceipts', function ($table) {
            $table->dropColumn(['return_request_items', 'return_requested_by', 'return_requested_at']);
        });
    }
};
